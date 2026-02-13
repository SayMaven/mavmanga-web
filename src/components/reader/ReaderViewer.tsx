// src/components/reader/ReaderViewer.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ReaderHeader from "./ReaderHeader";
import ReaderSidebar, { FitMode } from "./ReaderSidebar";
import GapModal from "./GapModal";
import ReaderProgressBar from "./ReaderProgressBar";

// ... (Interface Props TETAP SAMA) ...
interface ReaderViewerProps {
    images: string[];
    currentChapter: any;
    currentChapterId: string;
    chapterList: any[];
    mangaId: string;
    mangaTitle: string;
    scanlationGroup: string;
}

export default function ReaderViewer({ 
    images, 
    currentChapter,
    currentChapterId,
    chapterList,
    mangaId,
    mangaTitle,
    scanlationGroup
}: ReaderViewerProps) {
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showUI, setShowUI] = useState(false); 
    const [showSidebar, setShowSidebar] = useState(false);
    const [fitMode, setFitMode] = useState<FitMode>('height'); 
    
    const [isGapModalOpen, setIsGapModalOpen] = useState(false);
    const [pendingNextChapterId, setPendingNextChapterId] = useState<string | null>(null);
    const [gapDetails, setGapDetails] = useState({ curr: '', next: '' });

    const isNavigatingRef = useRef(false);

    // ... (Data Extraction & findNextChapter TETAP SAMA) ...
    // Copy paste bagian ini dari kode sebelumnya
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

    // ... (Navigation Handlers TETAP SAMA) ...
    const goToNextPage = useCallback(() => {
        if (currentIndex < images.length - 1) {
            isNavigatingRef.current = true; 
            setCurrentIndex(prev => prev + 1);
            setShowUI(false); 
            if (fitMode === 'width') window.scrollTo({ top: 0 }); 
            setTimeout(() => { isNavigatingRef.current = false; }, 300);
        } else { findNextChapter(); }
    }, [currentIndex, images.length, fitMode, findNextChapter]);

    const goToPrevPage = useCallback(() => {
        if (currentIndex > 0) {
            isNavigatingRef.current = true;
            setCurrentIndex(prev => prev - 1);
            setShowUI(false);
            if (fitMode === 'width') window.scrollTo({ top: 0 });
            setTimeout(() => { isNavigatingRef.current = false; }, 300);
        }
    }, [currentIndex, fitMode]);

    const handleJumpToPage = useCallback((index: number) => {
        isNavigatingRef.current = true;
        setCurrentIndex(index);
        setShowUI(false);
        if (fitMode === 'width') window.scrollTo({ top: 0 });
        setTimeout(() => { isNavigatingRef.current = false; }, 300);
    }, [fitMode]);

    // ... (Keyboard Handler TETAP SAMA) ...
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isGapModalOpen) return;
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') goToNextPage();
            if (e.key === 'ArrowLeft') goToPrevPage();
            if (e.key === 'Escape') { setShowUI(false); setShowSidebar(false); }
            if (e.key === 'm') setShowUI(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNextPage, goToPrevPage, isGapModalOpen]);

    // --- SCROLL HANDLER (DIPERBAIKI) ---
    // Logika: 
    // - Scroll Bawah (> 10): Tutup UI
    // - Scroll Atas (< -10): Buka UI (tapi hanya jika bukan saat navigasi)
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isNavigatingRef.current) return; // Jangan trigger saat ganti halaman otomatis

            if (e.deltaY > 10 && showUI) {
                // Scroll ke bawah -> Hide UI
                setShowUI(false);
            } else if (e.deltaY < -10 && !showUI) {
                // Scroll ke atas -> Show UI
                setShowUI(true);
            }
        };
        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [showUI]);

    const handleZoneClick = (zone: 'left' | 'center' | 'right') => {
        if (showSidebar) { setShowSidebar(false); return; }
        if (isGapModalOpen) return;
        
        if (zone === 'center') setShowSidebar(prev => !prev);
        else if (zone === 'left') goToPrevPage();
        else if (zone === 'right') goToNextPage();
    };

    const getImageStyle = () => {
        switch(fitMode) {
            case 'height': return 'h-screen w-auto object-contain';
            case 'width': return 'w-full h-auto object-contain';
            case 'original': return 'max-w-none';
            default: return 'h-screen w-auto object-contain';
        }
    };

    return (
        <div className={`relative w-full h-screen bg-[#121212] select-none z-[100] ${fitMode === 'height' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            
            <div className={`w-full min-h-full flex items-center justify-center ${fitMode === 'height' ? 'h-full' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={images[currentIndex]} 
                    alt={`Page ${currentIndex + 1}`}
                    className={`transition-all duration-200 ${getImageStyle()}`}
                    loading="eager"
                />
            </div>

            <div className="fixed inset-0 flex z-10">
                <div className="w-[30%] h-full cursor-pointer" onClick={() => handleZoneClick('left')} title="Previous Page" />
                <div className="w-[40%] h-full cursor-default" onClick={() => handleZoneClick('center')} title="Toggle Menu" />
                <div className="w-[30%] h-full cursor-pointer" onClick={() => handleZoneClick('right')} title="Next Page" />
            </div>

            <GapModal 
                isOpen={isGapModalOpen}
                currChapter={gapDetails.curr}
                nextChapter={gapDetails.next}
                onCancel={() => setIsGapModalOpen(false)}
                onContinue={() => { if (pendingNextChapterId) router.push(`/read/${pendingNextChapterId}`); }}
                onBackToTitle={() => router.push(`/manga/${mangaId}`)}
            />

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

            <ReaderSidebar 
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                fitMode={fitMode}
                setFitMode={setFitMode}
                onPrev={goToPrevPage}
                onNext={goToNextPage}
                mangaId={mangaId}
            />

            <ReaderProgressBar 
                currentIndex={currentIndex}
                totalImages={images.length}
                onPageChange={handleJumpToPage}
            />
        </div>
    );
}