// src/components/manga/LibraryButton.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

type ReadingStatus = 'reading' | 'on_hold' | 'dropped' | 'plan_to_read' | 'completed' | 're_reading' | null;

export default function LibraryButton({ manga }: { manga: any }) {
  // State
  const [isOpen, setIsOpen] = useState(false); // Modal visibility
  const [status, setStatus] = useState<ReadingStatus>(null); // DB Status
  const [tempStatus, setTempStatus] = useState<ReadingStatus>(null); // Temporary Status in Modal
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- LOGIC JUDUL CERDAS (Updated) ---
  const getSmartTitle = () => {
      const attr = manga.attributes;
      const ogLang = attr.originalLanguage; 
      const altTitles = attr.altTitles || [];

      const findTitle = (lang: string) => {
          return attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
      };

      // Fallback title (ambil value pertama dari object title)
      const fallbackTitle = (typeof attr.title === 'object') ? Object.values(attr.title)[0] as string : attr.title;

      let mainTitle = "";

      if (ogLang === 'ja') {
          // Jepang: Romaji -> English -> Kanji -> Fallback
          mainTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallbackTitle;
      } else {
          // Luar Jepang: English -> Romaji -> Asli -> Fallback
          mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
      }
      
      return mainTitle || "Untitled";
  };

  const title = getSmartTitle(); // Gunakan fungsi ini untuk judul
  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const coverUrl = coverRel?.attributes?.fileName 
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`
    : 'https://placehold.co/300x450';

  // Load Status dari LocalStorage
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

  // Handle Klik Luar untuk menutup Dropdown
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

  // Fungsi Save (DIPERBARUI)
  const handleSave = () => {
    const savedData = localStorage.getItem('maven_library');
    let library = savedData ? JSON.parse(savedData) : [];
    
    // Hapus data lama
    library = library.filter((item: any) => item.id !== manga.id);

    // Jika status tidak null, simpan data baru
    if (tempStatus) {
      library.push({
        id: manga.id,
        title, // Simpan judul yang sudah diproses (Smart Title)
        cover: coverUrl,
        status: tempStatus,
        updatedAt: new Date().toISOString(),
        
        // Simpan atribut lengkap agar LibraryContent juga bisa memproses ulang jika perlu
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

  // Helper Label & Warna Tombol Trigger Utama
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
      if (status === 'reading') return 'bg-[#FF6740] hover:bg-[#ff5528] text-white'; // MangaDex Orange
      if (status === 'completed') return 'bg-blue-600 hover:bg-blue-500 text-white';
      return 'bg-[#3c3e44] hover:bg-[#4a4d55] text-white border border-[#FF6740]';
  };

  // Options Data
  const options = [
      { value: null, label: 'None' },
      { value: 'reading', label: 'Reading' }, 
      { value: 'on_hold', label: 'On Hold' },
      { value: 'dropped', label: 'Dropped' },
      { value: 'plan_to_read', label: 'Plan to Read' },
      { value: 'completed', label: 'Completed' },
      { value: 're_reading', label: 'Re-Reading' },
  ];

  const currentOption = options.find(o => o.value === tempStatus) || options[1]; // Default None

  return (
    <>
      {/* 1. MAIN TRIGGER BUTTON (Di Halaman Manga) */}
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

      {/* 2. MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200 md:scale-120">
            
            {/* MODAL BOX */}
            <div className="bg-[#191A1C] w-full max-w-xl rounded-lg shadow-2xl relative flex flex-col overflow-visible">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg">Add To Library</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex gap-6">
                    {/* Poster Kiri */}
                    <div className="w-32 flex-shrink-0">
                        <div className="rounded-md overflow-hidden shadow-lg aspect-[2/3]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Form Kanan */}
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-xl leading-tight mb-1">{title}</h4>
                        <p className="text-gray-400 text-xs font-bold uppercase mb-4">Reading Status</p>

                        {/* ROW: Dropdown + Bell Button */}
                        <div className="flex gap-2 relative" ref={dropdownRef}>
                            
                            {/* CUSTOM DROPDOWN TRIGGER */}
                            <div className="relative flex-1">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full text-left bg-[#232529] border ${isDropdownOpen ? 'border-[#FF6740]' : 'border-white/20'} 
                                    text-white rounded px-4 py-3 flex justify-between items-center hover:border-gray-400 transition`}
                                >
                                    <span className="font-medium">{currentOption.label}</span>
                                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>

                                {/* DROPDOWN MENU (Absolute) */}
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
                                                            ? 'bg-[#FF6740] text-white font-bold' // Selected State
                                                            : 'text-gray-300 hover:bg-white/10' // Normal State
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

                {/* Footer Buttons */}
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