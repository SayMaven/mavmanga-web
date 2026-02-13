// src/components/reader/ReaderSidebar.tsx
'use client';

import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { ReaderConfig, PageStyle } from "@/types/readerTypes";

interface ReaderSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    
    config: ReaderConfig;
    setConfig: (config: ReaderConfig) => void;
    onOpenSettings: () => void;

    mangaId: string;
    mangaTitle: string;
    currentChapter: any;
    currentChapterId: string;
    chapterList: any[];
    currentIndex: number;
    totalImages: number;
    onPageChange: (index: number) => void;
    onChapterChange: (chapterId: string) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    scanlationGroup: string;
    uploaderName?: string;
}

export default function ReaderSidebar({
    isOpen,
    onClose,
    config,
    setConfig,
    onOpenSettings,
    mangaId,
    mangaTitle,
    currentChapter,
    currentChapterId,
    chapterList,
    currentIndex,
    totalImages,
    onPageChange,
    onChapterChange,
    onPrevPage,
    onNextPage,
    scanlationGroup,
    uploaderName = "Unknown User"
}: ReaderSidebarProps) {
    
    const [openDropdown, setOpenDropdown] = useState<'page' | 'chapter' | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // --- DATA PROCESSING ---
    const { relevantChapters, groupedChapters, sortedVolumes } = useMemo(() => {
        const currentLang = currentChapter?.translatedLanguage || 'en';
        const relevant = chapterList
            .filter((ch: any) => ch.attributes.translatedLanguage === currentLang)
            .sort((a: any, b: any) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));

        const groups: Record<string, any[]> = {};
        const displayList = [...relevant].sort((a: any, b: any) => parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter));

        displayList.forEach((ch: any) => {
            const vol = ch.attributes.volume ? `Volume ${ch.attributes.volume}` : 'No Volume';
            if (!groups[vol]) groups[vol] = [];
            groups[vol].push(ch);
        });

        const vols = Object.keys(groups).sort((a, b) => {
            if (a === 'No Volume') return 1;
            if (b === 'No Volume') return -1;
            const numA = parseFloat(a.replace('Volume ', ''));
            const numB = parseFloat(b.replace('Volume ', ''));
            return numB - numA; 
        });

        return { relevantChapters: relevant, groupedChapters: groups, sortedVolumes: vols };
    }, [chapterList, currentChapter]);

    const getAdjacentChapterIds = () => {
        const idx = relevantChapters.findIndex((ch: any) => ch.id === currentChapterId);
        const prevId = idx > 0 ? relevantChapters[idx - 1].id : null;
        const nextId = idx !== -1 && idx < relevantChapters.length - 1 ? relevantChapters[idx + 1].id : null;
        return { prevId, nextId };
    };
    const { prevId: prevChapterId, nextId: nextChapterId } = getAdjacentChapterIds();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
            } else {
                const target = event.target as HTMLElement;
                if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-menu')) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleScrollPropagation = (e: React.WheelEvent) => e.stopPropagation();

    // Helper: Toggle Fit Mode
    const toggleFit = () => {
        setConfig({
            ...config,
            imageSizing: {
                ...config.imageSizing,
                containHeight: !config.imageSizing.containHeight,
                containWidth: !config.imageSizing.containWidth
            }
        });
    };

    // Helper: Cycle Page Style (Single -> Double -> Long -> Wide -> Single)
    const cyclePageStyle = () => {
        const modes: PageStyle[] = ['single', 'double', 'long-strip', 'wide-strip'];
        const currentIndex = modes.indexOf(config.pageStyle);
        const nextIndex = (currentIndex + 1) % modes.length;
        setConfig({ ...config, pageStyle: modes[nextIndex] });
    };

    // Helper: Get Label for current style
    const getPageStyleLabel = () => {
        switch(config.pageStyle) {
            case 'single': return 'Single Page';
            case 'double': return 'Double Page';
            case 'long-strip': return 'Long Strip';
            case 'wide-strip': return 'Wide Strip';
            default: return 'Single Page';
        }
    };

    return (
        <>
            <div 
                className={`fixed inset-0 z-[90] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-transparent" /> 
            </div>

            <div 
                ref={sidebarRef}
                onWheel={handleScrollPropagation}
                className={`fixed top-0 right-0 h-full w-[320px] bg-[#191A1C] border-l border-[#2f3136] z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* HEADER */}
                <div className="flex items-start justify-between p-4 pb-2">
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                     <button onClick={onOpenSettings} className="text-gray-400 hover:text-white" title="Open Settings">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                </div>

                {/* INFO MANGA */}
                <div className="px-4 pb-4">
                     <div className="flex items-start gap-3 mb-1">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <Link href={`/manga/${mangaId}`} className="text-[#FF6740] font-medium text-sm hover:underline leading-snug">
                            {mangaTitle}
                        </Link>
                    </div>
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p className="text-gray-200 text-sm font-medium">
                            {currentChapter?.chapter ? `Chapter ${currentChapter.chapter}` : 'Oneshot'}
                             {currentChapter?.title ? ` - ${currentChapter.title}` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar">
                    
                    {/* NAV ROW (Page) */}
                    <div className="flex items-center gap-2 relative z-20">
                        <button onClick={onPrevPage} className="w-10 h-10 flex items-center justify-center bg-[#232529] hover:bg-[#32353B] rounded text-gray-400 hover:text-white transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <div className="flex-1 relative">
                            <div className="text-[10px] text-gray-400 font-bold uppercase absolute left-3 top-1 pointer-events-none">Page</div>
                            <button onClick={() => setOpenDropdown(openDropdown === 'page' ? null : 'page')} className="w-full h-10 bg-[#232529] hover:bg-[#32353B] rounded flex items-center justify-between px-3 pt-3 text-sm text-white dropdown-trigger">
                                <span className="font-bold">{currentIndex + 1}</span>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'page' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {openDropdown === 'page' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#232529] rounded shadow-xl max-h-[250px] overflow-y-auto custom-scrollbar z-30 dropdown-menu" onWheel={handleScrollPropagation}>
                                    {Array.from({ length: totalImages }).map((_, idx) => (
                                        <div key={idx} onClick={() => { onPageChange(idx); setOpenDropdown(null); }} className={`px-4 py-2 text-sm cursor-pointer ${currentIndex === idx ? 'bg-[#FF6740] text-white' : 'text-gray-300 hover:bg-[#32353B]'}`}>{idx + 1}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onNextPage} className="w-10 h-10 flex items-center justify-center bg-[#232529] hover:bg-[#32353B] rounded text-gray-400 hover:text-white transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>

                    {/* NAV ROW (Chapter) */}
                    <div className="flex items-center gap-2 relative z-10">
                        <button onClick={() => prevChapterId && onChapterChange(prevChapterId)} disabled={!prevChapterId} className={`w-10 h-10 flex items-center justify-center bg-[#232529] rounded transition ${!prevChapterId ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#32353B] hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <div className="flex-1 relative">
                            <div className="text-[10px] text-gray-400 font-bold uppercase absolute left-3 top-1 pointer-events-none">Chapter</div>
                            <button onClick={() => setOpenDropdown(openDropdown === 'chapter' ? null : 'chapter')} className="w-full h-10 bg-[#232529] hover:bg-[#32353B] rounded flex items-center justify-between px-3 pt-3 text-sm text-white dropdown-trigger">
                                <span className="font-bold truncate pr-2">{currentChapter?.chapter ? `Chapter ${currentChapter.chapter}` : 'Oneshot'}</span>
                                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openDropdown === 'chapter' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {openDropdown === 'chapter' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#232529] rounded shadow-xl max-h-[300px] overflow-y-auto custom-scrollbar z-30 dropdown-menu" onWheel={handleScrollPropagation}>
                                    <div className="py-1">
                                        {sortedVolumes.map((volKey) => (
                                            <div key={volKey}>
                                                {volKey !== 'No Volume' && <div className="px-3 py-1 text-gray-500 text-[11px] font-medium border-b border-[#32353B]/50 mt-1">{volKey}</div>}
                                                {groupedChapters[volKey].map((ch: any) => {
                                                    const isActive = ch.id === currentChapterId;
                                                    return (
                                                        <div key={ch.id} onClick={() => { onChapterChange(ch.id); setOpenDropdown(null); }} className={`px-4 py-2 text-sm cursor-pointer ${isActive ? 'bg-[#FF6740] text-white' : 'text-gray-300 hover:bg-[#32353B]'}`}>
                                                            <div className="flex flex-col"><span className="font-bold text-sm">{ch.attributes.chapter ? `Chapter ${ch.attributes.chapter}` : 'Oneshot'}</span>{ch.attributes.title && <span className={`text-[11px] truncate ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{ch.attributes.title}</span>}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => nextChapterId && onChapterChange(nextChapterId)} disabled={!nextChapterId} className={`w-10 h-10 flex items-center justify-center bg-[#232529] rounded transition ${!nextChapterId ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#32353B] hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>

                    <div className="border-t border-[#2f3136] my-2" />

                    {/* UPLOADED BY */}
                    <div className="pb-2">
                        <h4 className="text-gray-400 text-xs font-bold mb-2 uppercase">Uploaded By</h4>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 bg-[#32353B] rounded-full flex items-center justify-center flex-shrink-0 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <span className="text-sm font-medium text-white hover:text-[#FF6740] cursor-pointer transition truncate">{scanlationGroup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-[#32353B] rounded-full flex items-center justify-center flex-shrink-0 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <span className="text-sm font-medium text-[#FF6740] cursor-pointer transition truncate">{uploaderName}</span>
                        </div>
                    </div>

                    <div className="border-t border-[#2f3136] my-2" />

                    {/* SHORTCUT SETTINGS */}
                    <div className="space-y-1">
                        
                        {/* 1. BUTTON CYCLE PAGE STYLE */}
                        <button 
                            onClick={cyclePageStyle} // Panggil fungsi cycle
                            className="w-full h-10 bg-[#3c3e44] hover:bg-[#4a4d55] rounded flex items-center px-3 text-sm text-gray-200 transition gap-3 select-none"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            {/* Tampilkan label dinamis */}
                            <span>{getPageStyleLabel()}</span>
                        </button>

                        <div className="flex gap-1">
                            <button onClick={toggleFit} className="flex-1 h-10 bg-[#3c3e44] hover:bg-[#4a4d55] rounded flex items-center px-3 text-sm text-gray-200 transition gap-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                <span>{config.imageSizing.containHeight ? 'Fit Height' : 'Fit Width'}</span>
                            </button>
                             <button onClick={onOpenSettings} className="w-10 h-10 bg-[#3c3e44] hover:bg-[#4a4d55] rounded flex items-center justify-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>
                        </div>
                         <button onClick={onOpenSettings} className="w-full h-10 bg-[#3c3e44] hover:bg-[#4a4d55] rounded flex items-center px-3 text-sm text-gray-200 transition gap-3">
                             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                             <span>Reader Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}