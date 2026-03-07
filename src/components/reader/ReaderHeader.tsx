// src/components/reader/ReaderHeader.tsx
'use client';

import Link from "next/link"; 

interface ReaderHeaderProps {
    showUI: boolean;
    mangaTitle: string;
    mangaId: string;             
    currentChapter: any;         
    currentIndex: number;
    totalImages: number;
    scanlationGroup: string;
    onOpenSidebar: () => void;
}

export default function ReaderHeader({
    showUI,
    mangaTitle,
    mangaId,                     
    currentChapter,
    currentIndex,
    totalImages,
    scanlationGroup,
    onOpenSidebar
}: ReaderHeaderProps) {
    
    const vol = currentChapter?.volume;
    const ch = currentChapter?.chapter;
    const title = currentChapter?.title;

    const volChStr = [
        vol && vol !== 'none' ? `Vol. ${vol}` : null,
        ch && ch !== 'none' ? `Ch. ${ch}` : null
    ].filter(Boolean).join(', ');

    const mainDisplayTitle = title ? title : (volChStr || "Oneshot");

    return (
        <div 
            className={`fixed top-0 left-0 right-0 z-50 bg-[#191A1C]/95 backdrop-blur-md border-b border-[#32353B] transition-transform duration-300 ease-in-out shadow-xl
            ${showUI ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="flex flex-col p-4 w-full">
                
                {/* A. JUDUL */}
                <div className="mb-3">
                    {/* Judul Chapter (Putih Besar) - Hanya "Malam 2" */}
                    <h2 className="text-white font-bold text-xl leading-tight line-clamp-1">
                        {mainDisplayTitle}
                    </h2>
                    
                    {/* Judul Manga (Link ke Detail Manga) */}
                    <Link href={`/manga/${mangaId}`} className="inline-block">
                        <h1 className="text-[#FF6740] font-bold text-sm mt-1 truncate hover:underline cursor-pointer">
                            {mangaTitle}
                        </h1>
                    </Link>
                </div>

                {/* B. STATUS BAR */}
                <div className="flex items-center gap-1 h-9 text-xs sm:text-sm font-medium">
                    
                    {/* 1. Kiri (Info Vol/Ch Lengkap) */}
                    <div className="flex-1 bg-[#232529] border border-[#32353B] rounded-l flex items-center justify-center px-2 text-gray-300 h-full truncate">
                        {volChStr || "Oneshot"} 
                    </div>

                    {/* 2. Tengah (Halaman) */}
                    <div className="flex-1 bg-[#232529] border-y border-[#32353B] flex items-center justify-center px-2 text-gray-300 h-full">
                        Pg. {currentIndex + 1} / {totalImages}
                    </div>

                    {/* 3. Kanan (Menu) */}
                    <button 
                        onClick={onOpenSidebar}
                        className="flex-1 bg-[#232529] border border-[#32353B] rounded-r flex items-center justify-center px-2 text-white h-full hover:bg-[#32353B] transition group gap-1 cursor-pointer"
                    >
                        <span>Menu</span>
                        <svg className="w-3 h-3 text-white group-hover:text-[#FF6740] transition-colors -rotate-270" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>

                {/* C. SCANLATION GROUP */}
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-200">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span className="hover:text-white cursor-pointer transition">{scanlationGroup}</span>
                </div>

            </div>
        </div>
    );
}