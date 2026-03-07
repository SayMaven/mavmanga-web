// src/components/reader/ReaderViewer.tsx
'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReaderHeader from "./ReaderHeader";
import ReaderSidebar from "./ReaderSidebar"; 
import ReaderSettingsModal from "./ReaderSettingsModal";
import GapModal from "./GapModal";
import ReaderProgressBar from "./ReaderProgressBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ReaderConfig, PageStyle } from "@/types/readerTypes"; 
import { getChapterPages } from "@/services/mangadex";

interface ReaderViewerProps {
    chapterId: string;
    currentChapter: any; currentChapterId: string; chapterList: any[];
    mangaId: string; mangaTitle: string; scanlationGroup: string; uploaderName?: string;
}

export default function ReaderViewer({ 
    chapterId, currentChapter, currentChapterId, chapterList, mangaId, mangaTitle, scanlationGroup, uploaderName = "User"
}: ReaderViewerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const [images, setImages] = useState<string[]>([]);
    const [isLoadingImgs, setIsLoadingImgs] = useState(true);
    const [isImgError, setIsImgError] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showUI, setShowUI] = useState(false); 
    const [showSidebar, setShowSidebar] = useState(false);
    const [isWebtoonDetected, setIsWebtoonDetected] = useState(false);
    const [imageRatios, setImageRatios] = useState<{[key: number]: number}>({});
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
    const isNavigatingRef = useRef(false);

    const defaultConfig: ReaderConfig = { pageStyle: 'single', readingDirection: 'ltr', headerVisible: true, progressBarStyle: 'normal', cursorHint: 'none', fitMode: 'height', imageSizing: { containWidth: false, containHeight: true, stretchSmall: false, maxWidth: false, maxHeight: false }, turnPageByScroll: 'wheel', doubleClickFullscreen: false };
    const [readerConfig, setReaderConfig] = useState<ReaderConfig>(defaultConfig);
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGapModalOpen, setIsGapModalOpen] = useState(false);
    const [pendingNextChapterId, setPendingNextChapterId] = useState<string | null>(null);
    const [gapDetails, setGapDetails] = useState({ curr: '', next: '' });

    useEffect(() => {
        const fetchImages = async () => {
            setIsLoadingImgs(true); setIsImgError(false);
            const data = await getChapterPages(chapterId);
            if (data?.chapter?.data?.length) {
                const { baseUrl, chapter: { hash, data: files } } = data;
                setImages(files.map((file: string) => `${baseUrl}/data/${hash}/${file}`));
            } else { setIsImgError(true); }
            setIsLoadingImgs(false);
        };
        fetchImages();
        setIsWebtoonDetected(false);
    }, [chapterId, mangaId]);

    useEffect(() => {
        const chapLabel = currentChapter?.chapter ? `Chapter ${currentChapter.chapter}` : "Oneshot";
        document.title = `${currentIndex + 1} | ${chapLabel} - ${mangaTitle} | SayMaven`;
    }, [currentIndex, currentChapter, mangaTitle]); 

    const activePageStyle: PageStyle = useMemo(() => isWebtoonDetected ? 'long-strip' : (isMobile ? (readerConfig.pageStyle === 'long-strip' ? 'long-strip' : 'single') : readerConfig.pageStyle), [isWebtoonDetected, isMobile, readerConfig.pageStyle]);

    useEffect(() => {
        if (activePageStyle === 'long-strip' && containerRef.current) {
            const container = containerRef.current;
            const handleScroll = () => {
                if (isNavigatingRef.current) return; 
                let bestIdx = currentIndex, maxVis = 0;
                const cRect = container.getBoundingClientRect();
                imageRefs.current.forEach((img, idx) => {
                    if (!img) return;
                    const r = img.getBoundingClientRect(), vTop = Math.max(cRect.top, r.top), vBot = Math.min(cRect.bottom, r.bottom), vH = Math.max(0, vBot - vTop);
                    if (vH > maxVis) { maxVis = vH; bestIdx = idx; }
                });
                if (bestIdx !== currentIndex) setCurrentIndex(bestIdx);
            };
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activePageStyle, currentIndex, images.length]);

    useEffect(() => {
        const pos = searchParams.get('pos');
        setCurrentIndex((pos === 'last' && images.length > 0) ? images.length - 1 : 0);
    }, [images.length, searchParams]); 

    useEffect(() => {
        const saved = localStorage.getItem('maven_read_chapters');
        let rSet = new Set<string>();
        if (saved) try { rSet = new Set(JSON.parse(saved)); } catch(e){}
        if (!rSet.has(currentChapterId)) {
            rSet.add(currentChapterId);
            localStorage.setItem('maven_read_chapters', JSON.stringify(Array.from(rSet)));
            window.dispatchEvent(new Event("storage"));
        }
    }, [currentChapterId]);

    useEffect(() => {
        const sConf = localStorage.getItem('maven_reader_config');
        if (sConf) try { setReaderConfig({ ...defaultConfig, ...JSON.parse(sConf) }); } catch(e){}
        if (localStorage.getItem('maven_reader_sidebar') === 'true') setShowSidebar(true);
        setIsConfigLoaded(true);
    }, []);

    useEffect(() => { if (isConfigLoaded) localStorage.setItem('maven_reader_config', JSON.stringify(readerConfig)); }, [readerConfig, isConfigLoaded]);
    useEffect(() => { if (isConfigLoaded) localStorage.setItem('maven_reader_sidebar', showSidebar.toString()); }, [showSidebar, isConfigLoaded]);

    const imagesPerPage = useMemo(() => {
        if (activePageStyle === 'long-strip') return 1;
        if (activePageStyle === 'wide-strip') return 3;
        if (activePageStyle === 'double') return (imageRatios[currentIndex] > 1.2 || imageRatios[currentIndex + 1] > 1.2) ? 1 : 2;
        return 1;
    }, [activePageStyle, currentIndex, imageRatios]);

    const currentLang = currentChapter?.translatedLanguage || 'en';
    const findChap = useCallback((isNext: boolean) => {
        const sLang = chapterList.filter(c => c.attributes.translatedLanguage === currentLang).sort((a,b) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));
        const idx = sLang.findIndex(c => c.id === currentChapterId);
        if (isNext && idx !== -1 && idx < sLang.length - 1) {
            const next = sLang[idx + 1], currN = parseFloat(currentChapter?.chapter || '0'), nextN = parseFloat(next.attributes.chapter);
            if ((nextN - currN) > 1.001 || (Math.floor(nextN) - Math.floor(currN) > 1)) {
                setGapDetails({ curr: currentChapter?.chapter, next: next.attributes.chapter }); setPendingNextChapterId(next.id); setIsGapModalOpen(true);
            } else router.push(`/read/${next.id}`);
        } else if (!isNext && idx > 0) router.push(`/read/${sLang[idx - 1].id}?pos=last`);
        else router.push(`/manga/${mangaId}`);
    }, [chapterList, currentLang, currentChapterId, currentChapter, router, mangaId]);

    const goToPage = useCallback((isNext: boolean) => {
        if (activePageStyle === 'long-strip') return;
        if (isNext ? currentIndex < images.length - 1 : currentIndex > 0) {
            isNavigatingRef.current = true;
            setCurrentIndex(p => isNext ? Math.min(p + imagesPerPage, images.length - 1) : Math.max(p - 1, 0));
            setShowUI(false); if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 });
            setTimeout(() => { isNavigatingRef.current = false; }, 300);
        } else findChap(isNext);
    }, [activePageStyle, currentIndex, images.length, imagesPerPage, readerConfig.fitMode, findChap]);

    const handleJump = useCallback((index: number) => {
        isNavigatingRef.current = true; setCurrentIndex(Math.min(index, images.length - 1));
        if (activePageStyle === 'long-strip') imageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else { setShowUI(false); if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 }); }
        setTimeout(() => { isNavigatingRef.current = false; }, 500);
    }, [images.length, activePageStyle, readerConfig.fitMode]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isNavigatingRef.current || isSettingsOpen) return;
            if (e.deltaY > 10 && showUI) setShowUI(false); else if (e.deltaY < -20 && !showUI) setShowUI(true);
        };
        window.addEventListener('wheel', handleWheel); return () => window.removeEventListener('wheel', handleWheel);
    }, [showUI, isSettingsOpen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (isGapModalOpen || isSettingsOpen) return;
            const isLtr = readerConfig.readingDirection === 'ltr';
            if (e.key === 'ArrowRight') goToPage(isLtr); if (e.key === 'ArrowLeft') goToPage(!isLtr);
            if (e.key === ' ' || e.key === 'Enter') goToPage(true);
            if (e.key === 'Escape') setShowSidebar(false); if (e.key === 'm') setShowSidebar(p => !p);
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [goToPage, isGapModalOpen, isSettingsOpen, readerConfig.readingDirection]);

    const handleImgLoad = (idx: number, e: React.SyntheticEvent<HTMLImageElement>) => {
        const ratio = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight;
        if (!isWebtoonDetected && idx < 5 && ratio < 0.5) setIsWebtoonDetected(true);
        setImageRatios(p => p[idx] === ratio ? p : { ...p, [idx]: ratio });
    };

    if (isLoadingImgs) return <div className="h-screen flex items-center justify-center bg-[#121212] text-white">Loading pages...</div>;
    if (isImgError || !images.length) return <div className="h-screen flex items-center justify-center bg-[#121212] text-red-500">Failed to load pages.</div>;

    const imgStyle = (c: number) => `transition-all duration-200 object-contain ${readerConfig.imageSizing.containHeight ? 'h-screen w-auto' : readerConfig.imageSizing.containWidth ? 'w-full h-auto' : 'h-screen w-auto'} ${c===1?'max-w-full':c===2?'max-w-[50vw]':'max-w-[33vw]'}`;
    
    return (
        <div ref={containerRef} className={`relative w-full h-screen bg-[#121212] select-none z-[100] ${activePageStyle === 'long-strip' ? 'overflow-y-auto custom-scrollbar' : (readerConfig.imageSizing.containHeight ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar')}`}>
            {!isWebtoonDetected && <div className="hidden absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0">{images.slice(0, 5).map((src, i) => <img key={i} src={src} onLoad={(e) => handleImgLoad(i, e)} alt="pre" referrerPolicy="no-referrer" />)}</div>}

            {activePageStyle === 'long-strip' ? (
                <div className="w-full min-h-full flex flex-col items-center pb-20 pt-16 cursor-pointer" onClick={(e) => e.detail === 1 && setShowSidebar(p=>!p)}>
                    {images.map((src, i) => <img key={i} ref={el => { imageRefs.current[i] = el; }} src={src} alt={`P${i+1}`} onLoad={e => handleImgLoad(i, e)} className="w-full h-auto max-w-4xl object-contain mb-0.5" loading="lazy" referrerPolicy="no-referrer" />)}
                    <div className="flex flex-col gap-4 mt-8 mb-20 text-center cursor-default" onClick={e=>e.stopPropagation()}>
                        <p className="text-gray-400">End of Chapter</p>
                        <div className="flex gap-4 justify-center"><button onClick={()=>findChap(false)} className="px-6 py-3 bg-[#3c3e44] text-white rounded font-bold hover:bg-[#4a4d55]">Prev</button><button onClick={()=>findChap(true)} className="px-6 py-3 bg-[#FF6740] text-white rounded font-bold hover:bg-orange-600">Next</button></div>
                    </div>
                </div>
            ) : (
                <div className={`w-full min-h-full flex items-center justify-center gap-0.5 ${readerConfig.imageSizing.containHeight ? 'h-full' : ''} ${readerConfig.readingDirection === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {images.slice(currentIndex, currentIndex + imagesPerPage).map((src, i) => <img key={currentIndex+i} src={src} alt={`P${currentIndex+i+1}`} onLoad={e => handleImgLoad(currentIndex+i, e)} className={`${imgStyle(imagesPerPage)} shadow-lg`} loading="eager" referrerPolicy="no-referrer" />)}
                </div>
            )}

            {activePageStyle !== 'long-strip' && (
                <div className="fixed inset-0 flex z-10">
                    <div className="w-[30%] h-full cursor-pointer" onClick={() => {if(!showSidebar) goToPage(readerConfig.readingDirection!=='ltr'); else setShowSidebar(false)}} />
                    <div className="w-[40%] h-full" onClick={() => setShowSidebar(p=>!p)} />
                    <div className="w-[30%] h-full cursor-pointer" onClick={() => {if(!showSidebar) goToPage(readerConfig.readingDirection==='ltr'); else setShowSidebar(false)}} />
                </div>
            )}

            <GapModal isOpen={isGapModalOpen} currChapter={gapDetails.curr} nextChapter={gapDetails.next} onCancel={()=>setIsGapModalOpen(false)} onContinue={()=>{if(pendingNextChapterId) router.push(`/read/${pendingNextChapterId}`)}} onBackToTitle={()=>router.push(`/manga/${mangaId}`)} />
            <ReaderSettingsModal isOpen={isSettingsOpen} onClose={()=>setIsSettingsOpen(false)} config={readerConfig} setConfig={setReaderConfig} />
            
            {readerConfig.headerVisible && <ReaderHeader showUI={showUI} mangaTitle={mangaTitle} mangaId={mangaId} currentChapter={currentChapter} currentIndex={currentIndex} totalImages={images.length} scanlationGroup={scanlationGroup} onOpenSidebar={()=>setShowSidebar(true)} />}
            
            <ReaderSidebar isOpen={showSidebar} onClose={()=>setShowSidebar(false)} config={readerConfig} setConfig={setReaderConfig} onOpenSettings={()=>setIsSettingsOpen(true)} mangaId={mangaId} mangaTitle={mangaTitle} currentChapter={currentChapter} currentChapterId={currentChapterId} chapterList={chapterList} currentIndex={currentIndex} totalImages={images.length} scanlationGroup={scanlationGroup} uploaderName={uploaderName} isWebtoonMode={isWebtoonDetected} onPageChange={handleJump} onChapterChange={id=>router.push(`/read/${id}`)} onPrevPage={()=>goToPage(false)} onNextPage={()=>goToPage(true)} />
            
            {readerConfig.progressBarStyle !== 'hidden' && <ReaderProgressBar currentIndex={currentIndex} totalImages={images.length} onPageChange={handleJump} readingDirection={readerConfig.readingDirection} />}
        </div>
    );
}