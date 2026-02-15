// src/components/filters/TagFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { getMangaTags } from '@/services/mangadex';

interface TagFilterProps {
  includedTags: string[];
  excludedTags: string[];
  inclusionMode: string;
  exclusionMode: string;
  onUpdate: (inc: string[], exc: string[], incMode: string, excMode: string) => void;
}

export default function TagFilter({ 
    includedTags, excludedTags, inclusionMode, exclusionMode, onUpdate 
}: TagFilterProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
        const tags = await getMangaTags();
        if (tags) setAllTags(tags);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagClick = (tagId: string) => {
    let newInc = [...includedTags];
    let newExc = [...excludedTags];

    if (newInc.includes(tagId)) {
        newInc = newInc.filter(id => id !== tagId);
        newExc.push(tagId);
    } else if (newExc.includes(tagId)) {
        newExc = newExc.filter(id => id !== tagId);
    } else {
        newInc.push(tagId);
    }

    onUpdate(newInc, newExc, inclusionMode, exclusionMode);
  };

  const groups = ['format', 'genre', 'theme', 'content'];
  const groupedTags = groups.map(g => ({
    name: g,
    tags: allTags
        .filter(t => t.attributes.group === g)
        .filter(t => t.attributes.name.en.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.attributes.name.en.localeCompare(b.attributes.name.en))
  }));

  const getLabel = () => {
      const total = includedTags.length + excludedTags.length;
      if (total === 0) return "Include Any";
      return `${includedTags.length} Inc, ${excludedTags.length} Exc`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
       <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Filter Tags</label>
       
       <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 cursor-pointer h-10 flex items-center justify-between select-none"
       >
         <span className="truncate pr-2">{getLabel()}</span>
         <span className="text-[10px] text-gray-400">▼</span>
       </div>

       {isOpen && (
         <>
            {/* Backdrop Gelap untuk Mobile */}
            <div className="md:hidden fixed inset-0 bg-black/80 z-[90] backdrop-blur-sm" />

            {/* DROPDOWN CONTAINER */}
            <div className="
                /* --- MOBILE STYLES (Fixed Modal Tengah) --- */
                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-[90vw] max-h-[80vh] z-[100]
                flex flex-col 
                
                /* --- DESKTOP STYLES (Absolute Bawah Tombol) --- */
                md:absolute md:top-full md:left-0 md:mt-2 
                md:translate-x-0 md:translate-y-0 md:transform-none 
                md:w-[600px] lg:w-[800px] md:max-h-[60vh] md:z-50

                /* --- COMMON STYLES --- */
                bg-[#191A1C] border border-[#3b3e44] rounded-lg shadow-2xl p-4 overflow-hidden
            ">
            
            {/* Header Mobile Only (Close Button) */}
            <div className="flex justify-between items-center mb-4 md:hidden">
                <h3 className="text-white font-bold">Select Tags</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 bg-[#3b3e44] rounded-full text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Search */}
            <input 
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none mb-4"
                autoFocus
            />

            {/* Tag List */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-6 custom-scrollbar">
                {groupedTags.map((group) => (
                    group.tags.length > 0 && (
                        <div key={group.name}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase border-b border-white/10 pb-1 mb-2">
                                {group.name}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {group.tags.map((tag) => {
                                    const isInc = includedTags.includes(tag.id);
                                    const isExc = excludedTags.includes(tag.id);
                                    
                                    let btnClass = "bg-[#232529] text-gray-300 hover:bg-[#3b3e44]";
                                    if (isInc) btnClass = "bg-blue-600/80 text-white border-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]";
                                    if (isExc) btnClass = "bg-red-600/80 text-white border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.4)]";

                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => handleTagClick(tag.id)}
                                            className={`px-3 py-1 rounded text-[11px] font-bold border border-transparent transition-all ${btnClass}`}
                                        >
                                            {isExc && <span className="mr-1">✕</span>}
                                            {isInc && <span className="mr-1">✓</span>}
                                            {tag.attributes.name.en}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Bottom Options (Modes) */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 flex-shrink-0">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Inclusion Mode</label>
                    <div className="flex bg-[#232529] rounded p-1 border border-[#3b3e44]">
                        <button 
                            onClick={() => onUpdate(includedTags, excludedTags, 'AND', exclusionMode)}
                            className={`flex-1 text-xs py-1 rounded font-bold transition ${inclusionMode === 'AND' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            AND
                        </button>
                        <button 
                            onClick={() => onUpdate(includedTags, excludedTags, 'OR', exclusionMode)}
                            className={`flex-1 text-xs py-1 rounded font-bold transition ${inclusionMode === 'OR' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            OR
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Exclusion Mode</label>
                    <div className="flex bg-[#232529] rounded p-1 border border-[#3b3e44]">
                        <button 
                            onClick={() => onUpdate(includedTags, excludedTags, inclusionMode, 'AND')}
                            className={`flex-1 text-xs py-1 rounded font-bold transition ${exclusionMode === 'AND' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            AND
                        </button>
                        <button 
                            onClick={() => onUpdate(includedTags, excludedTags, inclusionMode, 'OR')}
                            className={`flex-1 text-xs py-1 rounded font-bold transition ${exclusionMode === 'OR' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            OR
                        </button>
                    </div>
                </div>
            </div>

         </div>
         </>
       )}
    </div>
  );
}