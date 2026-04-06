// src/components/filters/DemographicFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface DemographicFilterProps {
    selectedDemo: string;
    onChange: (demo: string) => void;
}

const DEMO_OPTIONS = [
    { label: 'Any', value: 'any' },
    { label: 'Shounen', value: 'shounen' },
    { label: 'Shoujo', value: 'shoujo' },
    { label: 'Seinen', value: 'seinen' },
    { label: 'Josei', value: 'josei' },
];

export default function DemographicFilter({ selectedDemo, onChange }: DemographicFilterProps) {
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
        setIsOpen(false);
    };

    const currentLabel = DEMO_OPTIONS.find(o => o.value === selectedDemo)?.label || 'Any';

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Demographic</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 cursor-pointer h-10 flex items-center justify-between select-none overflow-hidden"
            >
                <span className="capitalize truncate pr-2">{currentLabel}</span>
                <span className="text-[10px] text-gray-400">▼</span>
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#232529] border border-[#3b3e44] rounded shadow-2xl overflow-hidden py-1">
                    {DEMO_OPTIONS.map((opt) => {
                        const isSelected = selectedDemo === opt.value;
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