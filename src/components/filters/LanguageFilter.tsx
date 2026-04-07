// src/components/filters/LanguageFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface LanguageFilterProps {
  selectedLangs: string[];
  onChange: (langs: string[]) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'ja', label: 'Japanese', flag: 'jp' },
  { code: 'ko', label: 'Korean', flag: 'kr' },
  { code: 'zh', label: 'Chinese (Simplified)', flag: 'cn' },
  { code: 'zh-hk', label: 'Chinese (Traditional)', flag: 'hk' },
  { code: 'id', label: 'Indonesian', flag: 'id' },
  { code: 'fr', label: 'French', flag: 'fr' },
  { code: 'es', label: 'Spanish', flag: 'es' },
  { code: 'es-la', label: 'Spanish (LATAM)', flag: 'mx' },
  { code: 'pt-br', label: 'Portuguese (Br)', flag: 'br' },
  { code: 'pt', label: 'Portuguese (Pt)', flag: 'pt' },
  { code: 'ru', label: 'Russian', flag: 'ru' },
  { code: 'de', label: 'German', flag: 'de' },
  { code: 'it', label: 'Italian', flag: 'it' },
  { code: 'vi', label: 'Vietnamese', flag: 'vn' },
  { code: 'th', label: 'Thai', flag: 'th' },
  { code: 'tl', label: 'Filipino / Tagalog', flag: 'ph' },
  { code: 'ms', label: 'Malay', flag: 'my' },
  { code: 'hi', label: 'Hindi', flag: 'in' },
  { code: 'my', label: 'Burmese', flag: 'mm' },
  { code: 'ne', label: 'Nepali', flag: 'np' },
  { code: 'mn', label: 'Mongolian', flag: 'mn' },
  { code: 'ar', label: 'Arabic', flag: 'sa' },
  { code: 'fa', label: 'Persian', flag: 'ir' },
  { code: 'he', label: 'Hebrew', flag: 'il' },
  { code: 'bn', label: 'Bengali', flag: 'bd' },
  { code: 'kk', label: 'Kazakh', flag: 'kz' },
  { code: 'ta', label: 'Tamil', flag: 'in' },
  { code: 'tr', label: 'Turkish', flag: 'tr' },
  { code: 'pl', label: 'Polish', flag: 'pl' },
  { code: 'uk', label: 'Ukrainian', flag: 'ua' },
  { code: 'cs', label: 'Czech', flag: 'cz' },
  { code: 'hu', label: 'Hungarian', flag: 'hu' },
  { code: 'ro', label: 'Romanian', flag: 'ro' },
  { code: 'bg', label: 'Bulgarian', flag: 'bg' },
  { code: 'nl', label: 'Dutch', flag: 'nl' },
  { code: 'sv', label: 'Swedish', flag: 'se' },
  { code: 'no', label: 'Norwegian', flag: 'no' },
  { code: 'da', label: 'Danish', flag: 'dk' },
  { code: 'fi', label: 'Finnish', flag: 'fi' },
  { code: 'el', label: 'Greek', flag: 'gr' },
  { code: 'sr', label: 'Serbian', flag: 'rs' },
  { code: 'hr', label: 'Croatian', flag: 'hr' },
  { code: 'lt', label: 'Lithuanian', flag: 'lt' },
  { code: 'lv', label: 'Latvian', flag: 'lv' },
  { code: 'et', label: 'Estonian', flag: 'ee' },
  { code: 'sk', label: 'Slovak', flag: 'sk' },
  { code: 'sl', label: 'Slovenian', flag: 'si' },
  { code: 'ca', label: 'Catalan', flag: 'ad' },
  { code: 'ka', label: 'Georgian', flag: 'ge' },
  { code: 'az', label: 'Azerbaijani', flag: 'az' },
  { code: 'ur', label: 'Urdu', flag: 'pk' },
  { code: 'la', label: 'Latin', flag: 'va' },
  { code: 'eo', label: 'Esperanto', flag: 'un' },
];

export default function LanguageFilter({ selectedLangs, onChange }: LanguageFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const toggleLang = (code: string) => {
    if (selectedLangs.includes(code)) {
      onChange(selectedLangs.filter(l => l !== code));
    } else {
      onChange([...selectedLangs, code]);
    }
  };

  const filteredLangs = LANGUAGES.filter(l => 
    l.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLabel = () => {
    if (selectedLangs.length === 0) return "All Languages";
    if (selectedLangs.length === 1) return LANGUAGES.find(l => l.code === selectedLangs[0])?.label;
    return `${selectedLangs.length} Selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Original Language</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 cursor-pointer h-10 flex items-center justify-between select-none"
      >
        <span className="truncate pr-2">{getLabel()}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#232529] border border-[#3b3e44] rounded shadow-2xl overflow-hidden flex flex-col max-h-80">
          <div className="p-2 border-b border-[#3b3e44] sticky top-0 bg-[#232529] z-10">
            <div className="relative flex items-center">
                <span className="absolute text-3xl left-2 top-center text-gray-500">⌕</span>
                <input 
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#191A1C] border border-[#3b3e44] rounded pl-8 pr-2 py-1 text-xs text-white focus:border-orange-500 outline-none"
                    autoFocus
                />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1">
            {filteredLangs.map((lang) => {
              const isSelected = selectedLangs.includes(lang.code);
              return (
                <div 
                  key={lang.code}
                  onClick={() => toggleLang(lang.code)}
                  className="px-2 py-2 text-sm hover:bg-[#3b3e44] cursor-pointer flex items-center gap-3 transition-colors rounded"
                >
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-orange-600 border-orange-600' : 'border-gray-500 bg-transparent'}`}>
                      {isSelected && <span className="text-white text-[8px]">●</span>}
                   </div>
                   <img 
                     src={`https://flagcdn.com/w20/${lang.flag}.png`} 
                     alt={lang.code} 
                     className="w-5 h-auto rounded-[2px] shadow-sm"
                   />

                   <span className={isSelected ? "text-white font-medium" : "text-gray-300"}>
                     {lang.label}
                   </span>
                </div>
              );
            })}
            
            {filteredLangs.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">No language found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}