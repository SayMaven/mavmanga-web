// src/components/filters/TranslatedLanguageFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface TranslatedLanguageFilterProps {
  isEnabled: boolean;
  onEnableChange: (enabled: boolean) => void;
  selectedLangs: string[];
  onChange: (langs: string[]) => void;
}

// Data Bahasa (Sama dengan LanguageFilter)
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

export default function TranslatedLanguageFilter({ 
  isEnabled, 
  onEnableChange, 
  selectedLangs, 
  onChange 
}: TranslatedLanguageFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik luar
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
    if (!isEnabled) return "Filter Disabled";
    if (selectedLangs.length === 0) return "Any Language";
    if (selectedLangs.length === 1) return LANGUAGES.find(l => l.code === selectedLangs[0])?.label;
    return `${selectedLangs.length} Languages Selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* LABEL + CHECKBOX UTAMA */}
      <label className="flex items-center gap-2 mb-1.5 cursor-pointer select-none group w-fit">
        <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors ${isEnabled ? 'bg-orange-600 border-orange-600' : 'border-gray-500 bg-transparent'}`}>
            {isEnabled && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <input 
            type="checkbox" 
            className="hidden" 
            checked={isEnabled} 
            onChange={(e) => onEnableChange(e.target.checked)} 
        />
        <span className={`text-[10px] font-bold uppercase transition-colors ${isEnabled ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
            Has Translated Chapters
        </span>
      </label>
      
      {/* TRIGGER BUTTON (Disabled style jika checkbox mati) */}
      <div 
        onClick={() => isEnabled && setIsOpen(!isOpen)}
        className={`w-full bg-[#232529] border rounded px-3 py-2 text-sm h-10 flex items-center justify-between select-none transition-all
            ${isEnabled 
                ? 'border-[#3b3e44] text-gray-200 cursor-pointer focus:border-orange-500 hover:border-gray-500' 
                : 'border-[#3b3e44]/30 text-gray-600 cursor-not-allowed opacity-50'
            }
        `}
      >
        <span className="truncate pr-2">{getLabel()}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && isEnabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#232529] border border-[#3b3e44] rounded shadow-2xl overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-100">
          
          {/* SEARCH BAR */}
          <div className="p-2 border-b border-[#3b3e44] sticky top-0 bg-[#232529] z-10">
            <div className="relative flex items-center">
                <span className="absolute text-3xl left-2 top-center text-gray-500">⌕</span>
                <input 
                    type="text"
                    placeholder="Search language..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#191A1C] border border-[#3b3e44] rounded pl-8 pr-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none placeholder-gray-600"
                    autoFocus
                />
            </div>
          </div>

          {/* LIST BAHASA */}
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {filteredLangs.map((lang) => {
              const isSelected = selectedLangs.includes(lang.code);
              return (
                <div 
                  key={lang.code}
                  onClick={() => toggleLang(lang.code)}
                  className="px-2 py-2 text-sm hover:bg-[#3b3e44] cursor-pointer flex items-center gap-3 transition-colors rounded group"
                >
                   {/* Checkbox Style */}
                   <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-orange-600 border-orange-600' : 'border-gray-500 bg-transparent group-hover:border-gray-400'}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                   </div>
                   
                   {/* Flag */}
                   <img 
                     src={`https://flagcdn.com/w20/${lang.flag}.png`} 
                     alt={lang.code} 
                     className="w-5 h-auto rounded-[2px] shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                   />
                   
                   {/* Label */}
                   <span className={isSelected ? "text-white font-medium" : "text-gray-300"}>
                     {lang.label}
                   </span>
                </div>
              );
            })}
            
            {filteredLangs.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500 italic">No language found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}