// src/components/filters/StatusFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface StatusFilterProps {
  selectedStatus: string[];
  onChange: (status: string[]) => void;
}

const STATUS_OPTIONS = [
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Hiatus', value: 'hiatus' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function StatusFilter({ selectedStatus, onChange }: StatusFilterProps) {
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

  const toggleStatus = (value: string) => {
    // Safety check: Pastikan selectedStatus adalah array sebelum di-filter
    const current = Array.isArray(selectedStatus) ? selectedStatus : [];

    if (current.includes(value)) {
      onChange(current.filter(s => s !== value));
    } else {
      onChange([...current, value]);
    }
  };

  const getLabel = () => {
    // SAFETY CHECK: Mencegah error .map is not a function
    if (!Array.isArray(selectedStatus) || selectedStatus.length === 0) return 'Any';
    
    return selectedStatus.map(s => STATUS_OPTIONS.find(o => o.value === s)?.label).join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Status</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 cursor-pointer h-10 flex items-center justify-between select-none overflow-hidden"
      >
        <span className="capitalize truncate pr-2">{getLabel()}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#232529] border border-[#3b3e44] rounded shadow-2xl overflow-hidden py-1">
          {STATUS_OPTIONS.map((opt) => {
            // Safety Check di sini juga
            const isSelected = Array.isArray(selectedStatus) && selectedStatus.includes(opt.value);
            
            return (
              <div 
                key={opt.value}
                onClick={() => toggleStatus(opt.value)} 
                className="px-3 py-2 text-sm hover:bg-[#3b3e44] cursor-pointer flex items-center gap-2 transition-colors"
              >
                 <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-orange-600 border-orange-600' : 'border-gray-500 bg-transparent'}`}>
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                 </div>
                 <span className={isSelected ? "text-white font-medium" : "text-gray-300"}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}