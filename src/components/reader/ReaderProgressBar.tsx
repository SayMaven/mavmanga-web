// src/components/reader/ReaderProgressBar.tsx
'use client';

import { useState } from "react";

interface ReaderProgressBarProps {
    currentIndex: number;
    totalImages: number;
    onPageChange: (index: number) => void;
}

export default function ReaderProgressBar({
    currentIndex,
    totalImages,
    onPageChange
}: ReaderProgressBarProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-1 pt-6 flex items-end justify-center gap-3 group transition-all duration-300 hover:pb-3">
            
            {/* 1. KIRI: Halaman Saat Ini */}
            <span className="text-white font-bold text-xs mb-[1px] shadow-black drop-shadow-md select-none w-6 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentIndex + 1}
            </span>

            {/* 2. TENGAH: Progress Bar */}
            <div className="flex-1 flex items-end h-1 group-hover:h-3 transition-all duration-200 ease-out">
                {Array.from({ length: totalImages }).map((_, idx) => {
                    const isActive = idx <= currentIndex;
                    const isHovered = hoveredIndex === idx;

                    return (
                        <div
                            key={idx}
                            // Style Segmen
                            className={`relative flex-1 h-full mx-[0.5px] first:rounded-l-full last:rounded-r-full cursor-pointer transition-colors duration-150
                                ${isHovered ? 'bg-white' : isActive ? 'bg-[#FF6740]' : 'bg-[#4a4a4a]'}
                            `}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onPageChange(idx);
                            }}
                        >
                            {/* TOOLTIP: Hanya muncul saat hover spesifik */}
                            {isHovered && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none z-[80] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center">
                                    
                                    {/* BUBBLE LINGKARAN */}
                                    <div 
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border border-[#32353B] mb-1
                                            ${isActive ? 'bg-[#FF6740]' : 'bg-[#3c3e44]'}
                                        `}
                                    >
                                        {idx + 1}
                                    </div>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. KANAN: Total Halaman */}
            <span className="text-gray-400 font-bold text-xs mb-[1px] shadow-black drop-shadow-md select-none w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {totalImages}
            </span>

        </div>
    );
}