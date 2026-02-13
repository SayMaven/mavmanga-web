// src/components/reader/ReaderProgressBar.tsx
'use client';

import { useState } from "react";
import { ReadingDirection } from "@/types/readerTypes";

interface ReaderProgressBarProps {
    currentIndex: number;
    totalImages: number;
    onPageChange: (index: number) => void;
    readingDirection?: ReadingDirection;
}

export default function ReaderProgressBar({
    currentIndex,
    totalImages,
    onPageChange,
    readingDirection = 'ltr'
}: ReaderProgressBarProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // 1. Buat array index halaman
    let indices = Array.from({ length: totalImages }, (_, i) => i);

    // 2. Jika RTL (Right to Left), balik urutan visualnya
    // Agar bar paling kanan = halaman 1
    if (readingDirection === 'rtl') {
        indices = indices.reverse();
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-1 pt-6 flex items-end justify-center gap-3 group transition-all duration-300 hover:pb-3 cursor-default">
            
            {/* Indikator Halaman Saat Ini (Kiri) */}
            <span className="text-white font-bold text-xs mb-[1px] shadow-black drop-shadow-md select-none w-6 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentIndex + 1}
            </span>

            {/* Container Bar */}
            <div className="flex-1 flex items-end h-1 group-hover:h-3 transition-all duration-200 ease-out gap-[1px]">
                {indices.map((pageIndex) => {
                    const isActive = pageIndex <= currentIndex;
                    const isHovered = hoveredIndex === pageIndex;

                    return (
                        <div
                            key={pageIndex}
                            // Style per segmen
                            className={`relative flex-1 h-full first:rounded-l-full last:rounded-r-full cursor-pointer transition-colors duration-150
                                ${isHovered ? 'bg-white' : isActive ? 'bg-[#FF6740]' : 'bg-[#4a4a4a]'}
                            `}
                            onMouseEnter={() => setHoveredIndex(pageIndex)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onPageChange(pageIndex);
                            }}
                        >
                            {/* TOOLTIP (Bubble) */}
                            {isHovered && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none z-[80] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center">
                                    <div 
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border border-[#32353B]
                                            ${isActive ? 'bg-[#FF6740]' : 'bg-[#3c3e44]'}
                                        `}
                                    >
                                        {pageIndex + 1}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Total Halaman (Kanan) */}
            <span className="text-gray-400 font-bold text-xs mb-[1px] shadow-black drop-shadow-md select-none w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {totalImages}
            </span>

        </div>
    );
}