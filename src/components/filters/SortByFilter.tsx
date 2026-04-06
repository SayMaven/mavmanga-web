// src/components/filters/SortByFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface SortByFilterProps {
    selectedSort: string;
    onChange: (sort: string) => void;
}

const SORT_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Best Match', value: 'relevance' },
    { label: 'Latest Upload', value: 'latest_upload' },
    { label: 'Oldest Upload', value: 'oldest_upload' },
    { label: 'Title Ascending', value: 'title_asc' },
    { label: 'Title Descending', value: 'title_desc' },
    { label: 'Highest Rating', value: 'rating_high' },
    { label: 'Lowest Rating', value: 'rating_low' },
    { label: 'Most Follows', value: 'follows_high' },
    { label: 'Fewest Follows', value: 'follows_low' },
    { label: 'Recently Added', value: 'created_new' },
    { label: 'Oldest Added', value: 'created_old' },
    { label: 'Year Ascending', value: 'year_asc' },
    { label: 'Year Descending', value: 'year_desc' },
];

export default function SortByFilter({ selectedSort, onChange }: SortByFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        onChange(value);
        setIsOpen(false); // Tutup dropdown otomatis setelah milih
    };

    const currentLabel = SORT_OPTIONS.find(o => o.value === selectedSort)?.label || 'None';

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Sort By</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 cursor-pointer h-10 flex items-center justify-between select-none overflow-hidden"
            >
                <span className="capitalize truncate pr-2">{currentLabel}</span>
                <span className="text-[10px] text-gray-400">▼</span>
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#232529] border border-[#3b3e44] rounded shadow-2xl overflow-y-auto max-h-60 py-1 custom-scrollbar">
                    {SORT_OPTIONS.map((opt) => {
                        const isSelected = selectedSort === opt.value;
                        return (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-3 py-2 text-sm hover:bg-[#3b3e44] cursor-pointer flex items-center transition-colors ${isSelected ? 'text-orange-500 font-bold' : 'text-gray-300'}`}
                            >
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}