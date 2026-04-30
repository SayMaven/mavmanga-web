// src/components/reader/ReaderViewer.tsx
'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReaderHeader from './ReaderHeader';
import ReaderSidebar from './ReaderSidebar';
import ReaderSettingsModal from './ReaderSettingsModal';
import GapModal from './GapModal';
import ReaderProgressBar from './ReaderProgressBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ReaderConfig, PageStyle } from '@/types/readerTypes';
import { fetchChapterPagesServer } from '@/app/actions';

interface ReaderViewerProps {
    chapterId: string;
    currentChapter: any;
    currentChapterId: string;
    chapterList: any[];
    mangaId: string;
    mangaTitle: string;
    scanlationGroup: string;
    scanlationGroupId?: string;
    uploaderName?: string;
}

const DEFAULT_CONFIG: ReaderConfig = {
    pageStyle: 'single',
    readingDirection: 'ltr',
    headerVisible: true,
    progressBarStyle: 'normal',
    cursorHint: 'none',
    fitMode: 'height',
    imageSizing: { containWidth: false, containHeight: true, stretchSmall: false, maxWidth: false, maxHeight: false },
    turnPageByScroll: 'wheel',
    doubleClickFullscreen: false,
};

export default function ReaderViewer({
    chapterId, currentChapter, currentChapterId, chapterList,
    mangaId, mangaTitle, scanlationGroup, scanlationGroupId, uploaderName = 'User'
}: ReaderViewerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [images, setImages] = useState<string[]>([]);
    const [isLoadingImgs, setIsLoadingImgs] = useState(true);
    const [isImgError, setIsImgError] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    // BUG FIX #4: showUI always starts false so reader opens focused on images
    const [showUI, setShowUI] = useState(false);
    // BUG FIX #4: showSidebar always starts false regardless of localStorage
    const [showSidebar, setShowSidebar] = useState(false);
    const [isWebtoonDetected, setIsWebtoonDetected] = useState(false);
    const [imageRatios, setImageRatios] = useState<{ [key: number]: number }>({});

    // BUG FIX #1 (long-strip desktop): Use a separate scroll container ref,
    // and render fixed overlays OUTSIDE this container (via a portal-like wrapper).
    // We achieve this by NOT putting transform on the scroll container and instead
    // wrapping the whole reader in a non-transformed root div.
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
    const isNavigatingRef = useRef(false);

    // BUG FIX #3 (mobile scroll header): track last scroll position for touch
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // Long-strip tap detection (to avoid blocking scroll with overlay)
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const [readerConfig, setReaderConfig] = useState<ReaderConfig>(DEFAULT_CONFIG);
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGapModalOpen, setIsGapModalOpen] = useState(false);
    const [pendingNextChapterId, setPendingNextChapterId] = useState<string | null>(null);
    const [gapDetails, setGapDetails] = useState({ curr: '', next: '' });

    // ── Fetch pages ──────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const fetchImages = async () => {
            setIsLoadingImgs(true);
            setIsImgError(false);
            // BUG FIX #4: reset UI state on every chapter load
            setShowUI(false);
            setShowSidebar(false);
            const data = await fetchChapterPagesServer(chapterId);
            if (cancelled) return;
            if (data?.chapter?.data?.length) {
                const { chapter: { hash, data: files } } = data;
                const myProxy = process.env.NEXT_PUBLIC_PROXY;
                setImages(files.map((file: string) =>
                    `${myProxy}https://uploads.mangadex.org/data/${hash}/${file}`
                ));
            } else {
                setIsImgError(true);
            }
            setIsLoadingImgs(false);
        };
        fetchImages();
        setIsWebtoonDetected(false);
        return () => { cancelled = true; };
    }, [chapterId]);

    // ── Document title ───────────────────────────────────────
    useEffect(() => {
        const chapLabel = currentChapter?.chapter ? `Ch. ${currentChapter.chapter}` : 'Oneshot';
        document.title = `${currentIndex + 1} | ${chapLabel} · ${mangaTitle}`;
    }, [currentIndex, currentChapter, mangaTitle]);

    // ── Active page style ─────────────────────────────────────
    const activePageStyle: PageStyle = useMemo(() =>
        isWebtoonDetected ? 'long-strip'
            : (isMobile ? (readerConfig.pageStyle === 'long-strip' ? 'long-strip' : 'single') : readerConfig.pageStyle),
        [isWebtoonDetected, isMobile, readerConfig.pageStyle]
    );

    const isLongStrip = activePageStyle === 'long-strip';

    // ── Scroll tracking (long-strip) ─────────────────────────
    useEffect(() => {
        if (activePageStyle !== 'long-strip' || !scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        let rafId = 0;

        const handleScroll = () => {
            if (isNavigatingRef.current) return;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                let bestIdx = currentIndex, maxVis = 0;
                const cRect = container.getBoundingClientRect();
                imageRefs.current.forEach((img, idx) => {
                    if (!img) return;
                    const r = img.getBoundingClientRect();
                    const vH = Math.max(0, Math.min(cRect.bottom, r.bottom) - Math.max(cRect.top, r.top));
                    if (vH > maxVis) { maxVis = vH; bestIdx = idx; }
                });
                if (bestIdx !== currentIndex) setCurrentIndex(bestIdx);

                // BUG FIX #3: Show/hide header based on scroll direction
                const currentScrollY = container.scrollTop;
                const delta = currentScrollY - lastScrollY.current;
                if (delta < -30) setShowUI(true);
                else if (delta > 10) setShowUI(false);
                lastScrollY.current = currentScrollY;
            });
        };

        // ── Long-strip tap detection for sidebar toggle ──────
        // Uses onClick on the content div directly (handles both desktop
        // mouse click and mobile tap) — no touch handlers needed here.

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, [activePageStyle, currentIndex, images.length]);

    // ── BUG FIX #3: Touch scroll for non-long-strip (window scroll) header show/hide ──
    useEffect(() => {
        if (!isMobile || isLongStrip) return;

        const handleScroll = () => {
            if (!ticking.current) {
                ticking.current = true;
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const delta = currentScrollY - lastScrollY.current;
                    if (delta < -30) {
                        setShowUI(true);
                    } else if (delta > 10) {
                        setShowUI(false);
                    }
                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile, isLongStrip]);

    // ── Init page index from URL ─────────────────────────────
    useEffect(() => {
        const pos = searchParams.get('pos');
        setCurrentIndex((pos === 'last' && images.length > 0) ? images.length - 1 : 0);
    }, [images.length, searchParams]);

    // ── Mark chapter as read ─────────────────────────────────
    useEffect(() => {
        try {
            const saved = localStorage.getItem('maven_read_chapters');
            const rSet: Set<string> = saved ? new Set(JSON.parse(saved)) : new Set();
            if (!rSet.has(currentChapterId)) {
                rSet.add(currentChapterId);
                localStorage.setItem('maven_read_chapters', JSON.stringify(Array.from(rSet)));
                window.dispatchEvent(new Event('storage'));
            }
        } catch { /* non-critical */ }
    }, [currentChapterId]);

    // ── Load/persist config ──────────────────────────────────
    useEffect(() => {
        try {
            const sConf = localStorage.getItem('maven_reader_config');
            if (sConf) setReaderConfig({ ...DEFAULT_CONFIG, ...JSON.parse(sConf) });
            // BUG FIX #4: Do NOT restore sidebar open state from localStorage
            // so reader always opens clean and focused on chapter images
        } catch { /* use defaults */ }
        setIsConfigLoaded(true);
    }, []);

    useEffect(() => {
        if (isConfigLoaded) localStorage.setItem('maven_reader_config', JSON.stringify(readerConfig));
    }, [readerConfig, isConfigLoaded]);

    // ── Images per page ──────────────────────────────────────
    const imagesPerPage = useMemo(() => {
        if (activePageStyle === 'long-strip') return 1;
        if (activePageStyle === 'wide-strip') return 3;
        if (activePageStyle === 'double')
            return (imageRatios[currentIndex] > 1.2 || imageRatios[currentIndex + 1] > 1.2) ? 1 : 2;
        return 1;
    }, [activePageStyle, currentIndex, imageRatios]);

    // ── Chapter navigation ───────────────────────────────────
    const currentLang = currentChapter?.translatedLanguage || 'en';
    const findChap = useCallback((isNext: boolean) => {
        // All chapters of the same language, sorted by chapter number ascending
        const sLang = chapterList
            .filter(c => c.attributes.translatedLanguage === currentLang)
            .sort((a, b) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));

        const currentChapNum = parseFloat(currentChapter?.chapter || '0');

        // Get the current scanlation group id to prefer same group for next chapter
        const currentGroupId = scanlationGroupId ?? null;

        if (isNext) {
            // Find the smallest chapter number strictly greater than current
            const nextChapNum = sLang
                .map(c => parseFloat(c.attributes.chapter))
                .find(n => n > currentChapNum);

            if (nextChapNum === undefined) {
                // No next chapter → go back to manga page
                router.push(`/manga/${mangaId}`);
                return;
            }

            // Among all entries with that chapter number, prefer same group
            const candidates = sLang.filter(c => parseFloat(c.attributes.chapter) === nextChapNum);
            const preferred = candidates.find(c =>
                currentGroupId &&
                c.relationships?.some((r: any) => r.type === 'scanlation_group' && r.id === currentGroupId)
            );
            const next = preferred ?? candidates[0];

            // Gap detection
            const gap = nextChapNum - currentChapNum;
            if (
                gap > 1.001 ||
                Math.floor(nextChapNum) - Math.floor(currentChapNum) > 1
            ) {
                setGapDetails({ curr: currentChapter?.chapter, next: next.attributes.chapter });
                setPendingNextChapterId(next.id);
                setIsGapModalOpen(true);
            } else {
                router.push(`/read/${next.id}`);
            }
        } else {
            // Find the largest chapter number strictly less than current
            const prevChapNum = [...sLang]
                .reverse()
                .map(c => parseFloat(c.attributes.chapter))
                .find(n => n < currentChapNum);

            if (prevChapNum === undefined) {
                router.push(`/manga/${mangaId}`);
                return;
            }

            const candidates = sLang.filter(c => parseFloat(c.attributes.chapter) === prevChapNum);
            const preferred = candidates.find(c =>
                currentGroupId &&
                c.relationships?.some((r: any) => r.type === 'scanlation_group' && r.id === currentGroupId)
            );
            const prev = preferred ?? candidates[candidates.length - 1];
            router.push(`/read/${prev.id}?pos=last`);
        }
    }, [chapterList, currentLang, currentChapterId, currentChapter, router, mangaId, scanlationGroupId]);

    // ── Page navigation ──────────────────────────────────────
    const goToPage = useCallback((isNext: boolean) => {
        if (activePageStyle === 'long-strip') return;
        if (isNext ? currentIndex < images.length - 1 : currentIndex > 0) {
            isNavigatingRef.current = true;
            setCurrentIndex(p => isNext ? Math.min(p + imagesPerPage, images.length - 1) : Math.max(p - 1, 0));
            setShowUI(false);
            if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 });
            setTimeout(() => { isNavigatingRef.current = false; }, 300);
        } else {
            findChap(isNext);
        }
    }, [activePageStyle, currentIndex, images.length, imagesPerPage, readerConfig.fitMode, findChap]);

    const handleJump = useCallback((index: number) => {
        isNavigatingRef.current = true;
        setCurrentIndex(Math.min(index, images.length - 1));
        if (activePageStyle === 'long-strip') {
            imageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            setShowUI(false);
            if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 });
        }
        setTimeout(() => { isNavigatingRef.current = false; }, 500);
    }, [images.length, activePageStyle, readerConfig.fitMode]);

    // ── Wheel → show/hide UI (desktop only) ─────────────────
    useEffect(() => {
        if (isMobile) return; // Mobile uses touch scroll handler instead
        const handleWheel = (e: WheelEvent) => {
            if (isNavigatingRef.current || isSettingsOpen) return;
            if (e.deltaY > 10 && showUI) setShowUI(false);
            else if (e.deltaY < -20 && !showUI) setShowUI(true);
        };
        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [showUI, isSettingsOpen, isMobile]);

    // ── Keyboard navigation ──────────────────────────────────
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (isGapModalOpen || isSettingsOpen) return;
            const isLtr = readerConfig.readingDirection === 'ltr';
            if (e.key === 'ArrowRight') goToPage(isLtr);
            else if (e.key === 'ArrowLeft') goToPage(!isLtr);
            else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); goToPage(true); }
            else if (e.key === 'Escape') setShowSidebar(false);
            else if (e.key === 'm') setShowSidebar(p => !p);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goToPage, isGapModalOpen, isSettingsOpen, readerConfig.readingDirection]);

    // ── Webtoon detection ────────────────────────────────────
    const handleImgLoad = useCallback((idx: number, e: React.SyntheticEvent<HTMLImageElement>) => {
        const ratio = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight;
        if (!isWebtoonDetected && idx < 5 && ratio < 0.5) setIsWebtoonDetected(true);
        setImageRatios(p => p[idx] === ratio ? p : { ...p, [idx]: ratio });
    }, [isWebtoonDetected]);

    // ── Image style ──────────────────────────────────────────
    const imgClass = useCallback((count: number) => {
        const fitClass = readerConfig.imageSizing.containHeight ? 'h-screen w-auto' : 'w-full h-auto';
        const maxClass = count === 1 ? 'max-w-full' : count === 2 ? 'max-w-[50vw]' : 'max-w-[33vw]';
        return `object-contain transition-opacity duration-150 ${fitClass} ${maxClass}`;
    }, [readerConfig.imageSizing.containHeight]);

    // ── Loading / error states ───────────────────────────────
    if (isLoadingImgs) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0f0f11] gap-4">
            <svg className="w-8 h-8 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">Loading pages…</p>
        </div>
    );

    if (isImgError || !images.length) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0f0f11] gap-3">
            <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-semibold">Failed to load pages</p>
            <button onClick={() => router.refresh()} className="text-orange-400 text-sm hover:underline">Try again</button>
        </div>
    );

    return (
        /*
         * BUG FIX #1 (Long-strip desktop):
         * The outer wrapper is a plain, non-scrolling, non-transformed div.
         * This ensures that `fixed` children (ReaderHeader, ReaderSidebar,
         * ReaderProgressBar) are positioned relative to the viewport, not
         * trapped inside a CSS stacking context caused by `transform`.
         *
         * BUG FIX #2 (Mobile overflow):
         * `overflow-x: hidden` on the outer wrapper prevents horizontal scroll/swipe
         * from revealing the sidebar accidentally.
         */
        <div
            className="relative w-full h-screen bg-[#0f0f11] select-none overflow-x-hidden"
            style={{ isolation: 'isolate' }}
        >
            {/* Preload first 5 images for webtoon detection (hidden) */}
            {!isWebtoonDetected && (
                <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
                    {images.slice(0, 5).map((src, i) => (
                        <img key={i} src={src} onLoad={(e) => handleImgLoad(i, e)} alt="" referrerPolicy="no-referrer" decoding="async" />
                    ))}
                </div>
            )}

            {/* ── SCROLL CONTAINER ── */}
            {/*
             * BUG FIX #1: The actual scroll container is a SEPARATE inner div,
             * without any `transform` that would create a new stacking context.
             * The `fixed` overlays are siblings of this div, not children.
             */}
            <div
                ref={scrollContainerRef}
                className={`absolute inset-0 ${
                    isLongStrip
                        ? 'overflow-y-auto overflow-x-hidden custom-scrollbar'
                        : (readerConfig.imageSizing.containHeight ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden custom-scrollbar')
                }`}
            >
                {/* ── LONG STRIP ── */}
                {isLongStrip ? (
                    <div
                        className="w-full min-h-full flex flex-col items-center pb-20 pt-16"
                        onClick={(e) => {
                            // Skip if clicking a button or link (prev/next chapter etc.)
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('a')) return;

                            // Toggle sidebar only when tapping/clicking center 60% of screen
                            const screenW = window.innerWidth;
                            const isCenter = e.clientX > screenW * 0.2 && e.clientX < screenW * 0.8;

                            if (isCenter) {
                                setShowSidebar(p => !p);
                            } else if (showSidebar) {
                                // If sidebar is open and we click outside center, close it
                                setShowSidebar(false);
                            }
                        }}
                    >
                        {images.map((src, i) => (
                            <img
                                key={i}
                                ref={el => { imageRefs.current[i] = el; }}
                                src={src}
                                alt={`Page ${i + 1}`}
                                onLoad={e => handleImgLoad(i, e)}
                                className="w-full h-auto max-w-4xl object-contain mb-0.5"
                                loading={i < 3 ? 'eager' : 'lazy'}
                                decoding="async"
                                referrerPolicy="no-referrer"
                            />
                        ))}
                        <div
                            className="flex flex-col gap-4 mt-10 mb-20 text-center"
                        >
                            <p className="text-gray-500 text-sm">— End of Chapter —</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => findChap(false)}
                                    className="px-6 py-2.5 bg-white/[0.06] border border-white/10 text-white rounded-lg font-bold hover:bg-white/10 transition-colors text-sm"
                                >
                                    ← Prev
                                </button>
                                <button
                                    onClick={() => findChap(true)}
                                    className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-400 transition-colors text-sm shadow-lg shadow-orange-500/20"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── SINGLE / DOUBLE / WIDE ── */
                    <div
                        className={`w-full min-h-full flex items-center justify-center gap-0.5 ${
                            readerConfig.imageSizing.containHeight ? 'h-full' : ''
                        } ${readerConfig.readingDirection === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {images.slice(currentIndex, currentIndex + imagesPerPage).map((src, i) => (
                            <img
                                key={currentIndex + i}
                                src={src}
                                alt={`Page ${currentIndex + i + 1}`}
                                onLoad={e => handleImgLoad(currentIndex + i, e)}
                                className={`${imgClass(imagesPerPage)} shadow-2xl`}
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                                referrerPolicy="no-referrer"
                                style={{ willChange: 'transform' }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Click zones (single/double mode) ── */}
            {/*
             * BUG FIX #2 (mobile): Click zones are fixed overlays.
             * On mobile, swipe-right gesture is blocked by overflow-x-hidden on root.
             * Center zone toggles sidebar only on explicit tap.
             */}
            {!isLongStrip && (
                <div className="fixed inset-0 flex z-10" aria-hidden="true">
                    <div className="w-[30%] h-full cursor-pointer" onClick={() => { if (!showSidebar) goToPage(readerConfig.readingDirection !== 'ltr'); else setShowSidebar(false); }} />
                    <div className="w-[40%] h-full" onClick={() => setShowSidebar(p => !p)} />
                    <div className="w-[30%] h-full cursor-pointer" onClick={() => { if (!showSidebar) goToPage(readerConfig.readingDirection === 'ltr'); else setShowSidebar(false); }} />
                </div>
            )}

            {/* Long-strip sidebar toggle is handled via touchstart/touchend
                 directly on the scroll container — no blocking overlay needed. */}

            {/* ── Modals ── */}
            <GapModal
                isOpen={isGapModalOpen}
                currChapter={gapDetails.curr}
                nextChapter={gapDetails.next}
                onCancel={() => setIsGapModalOpen(false)}
                onContinue={() => { if (pendingNextChapterId) router.push(`/read/${pendingNextChapterId}`); }}
                onBackToTitle={() => router.push(`/manga/${mangaId}`)}
            />
            <ReaderSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                config={readerConfig}
                setConfig={setReaderConfig}
            />

            {/* ── UI Overlays (outside scroll container so `fixed` works correctly) ── */}
            {readerConfig.headerVisible && (
                <ReaderHeader
                    showUI={showUI}
                    mangaTitle={mangaTitle}
                    mangaId={mangaId}
                    currentChapter={currentChapter}
                    currentIndex={currentIndex}
                    totalImages={images.length}
                    scanlationGroup={scanlationGroup}
                    onOpenSidebar={() => setShowSidebar(true)}
                />
            )}

            <ReaderSidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                config={readerConfig}
                setConfig={setReaderConfig}
                onOpenSettings={() => setIsSettingsOpen(true)}
                mangaId={mangaId}
                mangaTitle={mangaTitle}
                currentChapter={currentChapter}
                currentChapterId={currentChapterId}
                chapterList={chapterList}
                currentIndex={currentIndex}
                totalImages={images.length}
                scanlationGroup={scanlationGroup}
                uploaderName={uploaderName}
                isWebtoonMode={isWebtoonDetected}
                onPageChange={handleJump}
                onChapterChange={id => router.push(`/read/${id}`)}
                onPrevPage={() => goToPage(false)}
                onNextPage={() => goToPage(true)}
            />

            {readerConfig.progressBarStyle !== 'hidden' && (
                <ReaderProgressBar
                    currentIndex={currentIndex}
                    totalImages={images.length}
                    onPageChange={handleJump}
                    readingDirection={readerConfig.readingDirection}
                />
            )}
        </div>
    );
}