// src/components/manga/LibraryButton.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

type ReadingStatus = 'reading' | 'on_hold' | 'dropped' | 'plan_to_read' | 'completed' | 're_reading' | null;

export default function LibraryButton({ manga }: { manga: any }) {
  const [isOpen, setIsOpen] = useState(false); 
  const [status, setStatus] = useState<ReadingStatus>(null); 
  const [tempStatus, setTempStatus] = useState<ReadingStatus>(null); 

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const dropdownRef = useRef<HTMLDivElement>(null);
  const getSmartTitle = () => {
      const attr = manga.attributes;
      const ogLang = attr.originalLanguage; 
      const altTitles = attr.altTitles || [];

      const findTitle = (lang: string) => {
          return attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
      };

      const fallbackTitle = (typeof attr.title === 'object') ? Object.values(attr.title)[0] as string : attr.title;

      let mainTitle = "";

      if (ogLang === 'ja') {
          mainTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallbackTitle;
      } else {
          mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
      }
      
      return mainTitle || "Untitled";
  };

  const title = getSmartTitle(); 
  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const myProxy = "https://manga-proxy.wahyunanda1258.workers.dev/?url=";
  const coverUrl = coverRel?.attributes?.fileName 
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`
    : `https://placehold.co/300x450`;

  useEffect(() => {
    const savedData = localStorage.getItem('maven_library');
    if (savedData) {
      const library = JSON.parse(savedData);
      const item = library.find((i: any) => i.id === manga.id);
      if (item) {
        setStatus(item.status);
        setTempStatus(item.status);
      }
    }
  }, [manga.id]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleSave = () => {
    const savedData = localStorage.getItem('maven_library');
    let library = savedData ? JSON.parse(savedData) : [];
    
    library = library.filter((item: any) => item.id !== manga.id);

    if (tempStatus) {
      library.push({
        id: manga.id,
        title, 
        cover: coverUrl,
        status: tempStatus,
        updatedAt: new Date().toISOString(),
        attributes: {
            title: manga.attributes.title,
            altTitles: manga.attributes.altTitles,
            originalLanguage: manga.attributes.originalLanguage,
        }
      });
    }

    localStorage.setItem('maven_library', JSON.stringify(library));
    setStatus(tempStatus);
    setIsOpen(false);
  };

  const getStatusLabel = (s: ReadingStatus) => {
    switch(s) {
        case 'reading': return 'Reading';
        case 'on_hold': return 'On Hold';
        case 'plan_to_read': return 'Plan to Read';
        case 'dropped': return 'Dropped';
        case 'completed': return 'Completed';
        case 're_reading': return 'Re-Reading';
        default: return 'Add to Library';
    }
  };

  const getButtonColor = () => {
      if (!status) return 'bg-[#3c3e44] hover:bg-[#4a4d55] text-white';
      if (status === 'reading') return 'bg-[#FF6740] hover:bg-[#ff5528] text-white'; 
      if (status === 'completed') return 'bg-blue-600 hover:bg-blue-500 text-white';
      return 'bg-[#3c3e44] hover:bg-[#4a4d55] text-white border border-[#FF6740]';
  };

  const options = [
      { value: null, label: 'None' },
      { value: 'reading', label: 'Reading' }, 
      { value: 'on_hold', label: 'On Hold' },
      { value: 'dropped', label: 'Dropped' },
      { value: 'plan_to_read', label: 'Plan to Read' },
      { value: 'completed', label: 'Completed' },
      { value: 're_reading', label: 'Re-Reading' },
  ];

  const currentOption = options.find(o => o.value === tempStatus) || options[1]; 

  return (
    <>
      <button 
        onClick={() => {
            setTempStatus(status);
            setIsOpen(true);
        }}
        className={`px-4 py-2.5 rounded font-bold shadow-md transition flex items-center gap-2 uppercase text-sm ${getButtonColor()}`}
      >
        <span>{status ? '✔' : ''}</span> 
        {getStatusLabel(status)}
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200 md:scale-120">
            <div className="bg-[#191A1C] w-full max-w-xl rounded-lg shadow-2xl relative flex flex-col overflow-visible">
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg">Add To Library</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-6 flex gap-6">
                    <div className="w-32 flex-shrink-0">
                        <div className="rounded-md overflow-hidden shadow-lg aspect-[2/3]">
                            <img src={coverUrl} referrerPolicy="no-referrer" alt="cover" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h4 className="text-white font-bold text-xl leading-tight mb-1">{title}</h4>
                        <p className="text-gray-400 text-xs font-bold uppercase mb-4">Reading Status</p>
                        <div className="flex gap-2 relative" ref={dropdownRef}>
                            <div className="relative flex-1">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full text-left bg-[#232529] border ${isDropdownOpen ? 'border-[#FF6740]' : 'border-white/20'} 
                                    text-white rounded px-4 py-3 flex justify-between items-center hover:border-gray-400 transition`}
                                >
                                    <span className="font-medium">{currentOption.label}</span>
                                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-[#232529] border border-white/10 rounded shadow-2xl z-50 overflow-hidden">
                                            {options.map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => {
                                                        setTempStatus(opt.value as ReadingStatus);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors
                                                        ${tempStatus === opt.value 
                                                            ? 'bg-[#FF6740] text-white font-bold' 
                                                            : 'text-gray-300 hover:bg-white/10' 
                                                        }
                                                    `}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-[#232529] rounded-b-lg border-t border-white/5 flex justify-end gap-3 z-0">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-2 rounded bg-[#3c3e44] hover:bg-[#4a4d55] text-white font-bold text-sm transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-2 rounded bg-[#FF6740] hover:bg-[#ff5528] text-white font-bold text-sm shadow-lg transition transform active:scale-95"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}