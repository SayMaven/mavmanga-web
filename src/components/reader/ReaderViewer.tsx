// src/components/reader/ReaderViewer.tsx
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReaderHeader from "./ReaderHeader";
import ReaderSidebar from "./ReaderSidebar"; 
import ReaderSettingsModal from "./ReaderSettingsModal";
import { ReaderConfig, PageStyle } from "@/types/readerTypes"; 
import GapModal from "./GapModal";
import ReaderProgressBar from "./ReaderProgressBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ReaderViewerProps {
    images: string[];
    currentChapter: any;
    currentChapterId: string;
    chapterList: any[];
    mangaId: string;
    mangaTitle: string;
    scanlationGroup: string;
    uploaderName?: string;
}

export default function ReaderViewer({ 
    images, 
    currentChapter,
    currentChapterId,
    chapterList,
    mangaId,
    mangaTitle,
    scanlationGroup,
    uploaderName = "User"
}: ReaderViewerProps) {
    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showUI, setShowUI] = useState(false); 
    const [showSidebar, setShowSidebar] = useState(false);
    
    // Simpan rasio gambar untuk deteksi Landscape
    const [imageRatios, setImageRatios] = useState<{[key: number]: number}>({});

    // --- DEFAULT CONFIG (Cleaned Up) ---
    const defaultConfig: ReaderConfig = {
        pageStyle: 'single',
        readingDirection: 'rtl',
        headerVisible: true,
        progressBarStyle: 'normal',
        // progressBarPosition DIHAPUS agar tidak error
        cursorHint: 'none',
        fitMode: 'height',
        imageSizing: {
            containWidth: false,
            containHeight: true,
            stretchSmall: false,
            maxWidth: false,
            maxHeight: false,
        },
        turnPageByScroll: 'wheel',
        doubleClickFullscreen: false,
    };

    const [readerConfig, setReaderConfig] = useState<ReaderConfig>(defaultConfig);
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGapModalOpen, setIsGapModalOpen] = useState(false);
    const [pendingNextChapterId, setPendingNextChapterId] = useState<string | null>(null);
    const [gapDetails, setGapDetails] = useState({ curr: '', next: '' });
    
    const isNavigatingRef = useRef(false);

    // --- LOCAL STORAGE ---
    useEffect(() => {
        const savedConfig = localStorage.getItem('maven_reader_config');
        const savedSidebar = localStorage.getItem('maven_reader_sidebar');
        
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setReaderConfig({ ...defaultConfig, ...parsed });
            } catch (e) { console.error("Config parse error", e); }
        }
        if (savedSidebar === 'true') setShowSidebar(true);
        setIsConfigLoaded(true);
    }, []);

    useEffect(() => {
        if (isConfigLoaded) {
            localStorage.setItem('maven_reader_config', JSON.stringify(readerConfig));
        }
    }, [readerConfig, isConfigLoaded]);

    useEffect(() => {
        if (isConfigLoaded) {
            localStorage.setItem('maven_reader_sidebar', showSidebar.toString());
        }
    }, [showSidebar, isConfigLoaded]);


    // --- DISPLAY LOGIC ---
    const activePageStyle: PageStyle = isMobile ? 'single' : readerConfig.pageStyle;

    const imagesPerPage = useMemo(() => {
        if (activePageStyle === 'long-strip') return 1;
        if (activePageStyle === 'double') {
            const currentRatio = imageRatios[currentIndex] || 0;
            const nextRatio = imageRatios[currentIndex + 1] || 0;
            // Smart landscape detection
            if (currentRatio > 1.2) return 1;
            if (nextRatio > 1.2) return 1;
            return 2;
        }
        if (activePageStyle === 'wide-strip') return 3;
        return 1;
    }, [activePageStyle, currentIndex, imageRatios]);


    // --- DATA & NAV LOGIC ---
    const currentChapNum = currentChapter?.chapter || '?';
    const currentLang = currentChapter?.translatedLanguage || 'en';
    
    const findNextChapter = useCallback(() => {
        const sameLangChapters = chapterList.filter((ch: any) => ch.attributes.translatedLanguage === currentLang);
        sameLangChapters.sort((a: any, b: any) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));
        const currentIndexInList = sameLangChapters.findIndex((ch: any) => ch.id === currentChapterId);

        if (currentIndexInList !== -1 && currentIndexInList < sameLangChapters.length - 1) {
            const nextChap = sameLangChapters[currentIndexInList + 1];
            const currNumVal = parseFloat(currentChapNum);
            const nextNumVal = parseFloat(nextChap.attributes.chapter);
            
            if ((nextNumVal - currNumVal) > 1.001 || (Math.floor(nextNumVal) - Math.floor(currNumVal) > 1)) {
                setGapDetails({ curr: currentChapNum, next: nextChap.attributes.chapter });
                setPendingNextChapterId(nextChap.id);
                setIsGapModalOpen(true);
            } else { router.push(`/read/${nextChap.id}`); }
        } else { router.push(`/manga/${mangaId}`); }
    }, [chapterList, currentLang, currentChapterId, currentChapNum, router, mangaId]);

    const goToNextPage = useCallback(() => {
        if (activePageStyle === 'long-strip') return; 
        if (currentIndex < images.length - 1) {
            isNavigatingRef.current = true; 
            setCurrentIndex(prev => Math.min(prev + imagesPerPage, images.length - 1));
            setShowUI(false); 
            if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 }); 
            setTimeout(() => { isNavigatingRef.current = false; }, 300);
        } else { findNextChapter(); }
    }, [currentIndex, images.length, readerConfig.fitMode, findNextChapter, activePageStyle, imagesPerPage]);

    const goToPrevPage = useCallback(() => {
        if (activePageStyle === 'long-strip') return;
        if (currentIndex > 0) {
            isNavigatingRef.current = true;
            setCurrentIndex(prev => Math.max(prev - 1, 0));
            setShowUI(false);
            if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 });
            setTimeout(() => { isNavigatingRef.current = false; }, 300);
        }
    }, [currentIndex, readerConfig.fitMode, activePageStyle]);

    const handleJumpToPage = useCallback((index: number) => {
        isNavigatingRef.current = true;
        setCurrentIndex(Math.min(index, images.length - 1));
        setShowUI(false);
        if (readerConfig.fitMode === 'width') window.scrollTo({ top: 0 });
        setTimeout(() => { isNavigatingRef.current = false; }, 300);
    }, [readerConfig.fitMode, images.length]);

    // --- FIX SCROLL HANDLER (Long Strip & Paged) ---
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isNavigatingRef.current || isSettingsOpen) return;

            // Logika Universal:
            // Scroll Bawah (> 0) -> Hide UI
            // Scroll Atas (< 0) -> Show UI
            
            // Untuk long strip, ini akan bekerja alami saat user scroll konten
            // Untuk paged mode, ini juga bekerja saat user scroll mouse
            
            if (e.deltaY > 10 && showUI) {
                setShowUI(false);
            } else if (e.deltaY < -10 && !showUI) {
                setShowUI(true);
            }
        };
        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [showUI, isSettingsOpen]); // Hapus dependency activePageStyle agar logicnya konsisten

    // Keyboard Handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isGapModalOpen || isSettingsOpen) return;
            if (e.key === 'ArrowRight') {
                if (readerConfig.readingDirection === 'ltr') goToNextPage();
                else goToPrevPage();
            }
            if (e.key === 'ArrowLeft') {
                if (readerConfig.readingDirection === 'ltr') goToPrevPage();
                else goToNextPage();
            }
            if (e.key === ' ' || e.key === 'Enter') goToNextPage();
            if (e.key === 'Escape') setShowSidebar(false);
            if (e.key === 'm') setShowSidebar(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNextPage, goToPrevPage, isGapModalOpen, isSettingsOpen, readerConfig.readingDirection]);

    const handleZoneClick = (zone: 'left' | 'center' | 'right') => {
        if (isGapModalOpen || isSettingsOpen) return;
        
        if (zone === 'center') { 
            setShowSidebar(prev => !prev); 
            // Header tidak di-toggle disini sesuai request sebelumnya
        }
        else if (zone === 'left') { 
            if (showSidebar) setShowSidebar(false); 
            else {
                if (readerConfig.readingDirection === 'ltr') goToPrevPage();
                else goToNextPage();
            }
        }
        else if (zone === 'right') { 
            if (showSidebar) setShowSidebar(false); 
            else {
                if (readerConfig.readingDirection === 'ltr') goToNextPage();
                else goToPrevPage();
            }
        }
    };

    const handleImageLoad = (idx: number, e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        const ratio = naturalWidth / naturalHeight;
        setImageRatios(prev => {
            if (prev[idx] === ratio) return prev;
            return { ...prev, [idx]: ratio };
        });
    };

    const getPagedImageStyle = (count: number) => {
        let style = "transition-all duration-200 object-contain ";
        if (readerConfig.imageSizing.containHeight) style += "h-screen w-auto ";
        else if (readerConfig.imageSizing.containWidth) style += "w-full h-auto ";
        else style += "h-screen w-auto ";
        
        // Fix overflow
        if (count === 1) style += "max-w-full ";
        if (count === 2) style += "max-w-[50vw] "; 
        if (count === 3) style += "max-w-[33vw] "; 
        return style;
    };

    // Pastikan long-strip punya scrollbar
    const containerOverflowClass = activePageStyle === 'long-strip' 
        ? 'overflow-y-auto custom-scrollbar' 
        : (readerConfig.imageSizing.containHeight ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar');

    return (
        <div className={`relative w-full h-screen bg-[#121212] select-none z-[100] ${containerOverflowClass}`}>
            
            {/* A. LONG STRIP MODE */}
            {activePageStyle === 'long-strip' ? (
                <div 
                    className="w-full min-h-full flex flex-col items-center pb-20 pt-16 cursor-pointer"
                    onClick={(e) => {
                        // Fix: Klik tengah Long Strip membuka Sidebar
                        if (e.detail === 1) handleZoneClick('center');
                    }}
                >
                    {images.map((imgSrc, idx) => (
                        <img 
                            key={idx}
                            src={imgSrc} 
                            alt={`Page ${idx + 1}`}
                            className="w-full h-auto max-w-4xl object-contain mb-0.5" 
                            loading="lazy"
                            // Stop propagation agar scroll tidak terganggu
                            // tapi biarkan click event naik ke container
                        />
                    ))}
                    <div className="flex flex-col gap-4 mt-8 mb-20 text-center" onClick={(e) => e.stopPropagation()}>
                        <p className="text-gray-400">End of Chapter</p>
                        <button onClick={findNextChapter} className="px-6 py-3 bg-[#FF6740] text-white rounded font-bold hover:bg-orange-600 transition">
                            Next Chapter
                        </button>
                    </div>
                </div>
            ) : (
                /* B. PAGINATED MODE */
                <div 
                    className={`w-full min-h-full flex items-center justify-center gap-0.5 ${readerConfig.imageSizing.containHeight ? 'h-full' : ''}
                    ${readerConfig.readingDirection === 'rtl' ? 'flex-row-reverse' : 'flex-row'} 
                    `}
                >
                    {images.slice(currentIndex, currentIndex + imagesPerPage).map((src, idx) => {
                        const actualIdx = currentIndex + idx;
                        return (
                            <img 
                                key={actualIdx}
                                src={src} 
                                alt={`Page ${actualIdx + 1}`}
                                onLoad={(e) => handleImageLoad(actualIdx, e)}
                                className={`${getPagedImageStyle(imagesPerPage)} shadow-lg`}
                                loading="eager"
                            />
                        );
                    })}
                </div>
            )}

            {/* Click Zones (Paged Only) */}
            {activePageStyle !== 'long-strip' && (
                <div className="fixed inset-0 flex z-10">
                    <div className="w-[30%] h-full cursor-pointer" onClick={() => handleZoneClick('left')} title={readerConfig.readingDirection === 'ltr' ? "Previous" : "Next"} />
                    <div className="w-[40%] h-full cursor-default" onClick={() => handleZoneClick('center')} title="Toggle Menu" />
                    <div className="w-[30%] h-full cursor-pointer" onClick={() => handleZoneClick('right')} title={readerConfig.readingDirection === 'ltr' ? "Next" : "Previous"} />
                </div>
            )}

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
                
                onPageChange={(index) => handleJumpToPage(index)}
                onChapterChange={(chapterId) => router.push(`/read/${chapterId}`)}
                onPrevPage={goToPrevPage}
                onNextPage={goToNextPage}
            />

            {/* FIX ERROR: Hapus prop position */}
            {readerConfig.progressBarStyle !== 'hidden' && activePageStyle !== 'long-strip' && (
                <ReaderProgressBar 
                    currentIndex={currentIndex}
                    totalImages={images.length}
                    onPageChange={handleJumpToPage}
                    readingDirection={readerConfig.readingDirection} 
                />
            )}
        </div>
    );
}