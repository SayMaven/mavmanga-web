// src/components/manga/MangaTabs.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MangaTabsProps {
  children: React.ReactNode; 
  mangaId: string;
  covers: any[];
  recommendations: any[];
}

export default function MangaTabs({ children, mangaId, covers, recommendations }: MangaTabsProps) {
  const [activeTab, setActiveTab] = useState<'chapters' | 'art' | 'recommendations'>('chapters');

  return (
    <div className="w-full">
      
      {/* --- TAB NAVIGATION --- */}
      {/* Container Navigasi dengan Border Bawah Abu-abu Terang */}
      <div className="flex items-center gap-8 border-b border-white/20 mb-6 relative">
        
        <button
          onClick={() => setActiveTab('chapters')}
          className={`pb-3 text-sm font-bold border-b-[3px] transition-colors relative top-[2px] ${
            activeTab === 'chapters' 
              ? 'border-[#FF6740] text-white'  // Aktif: Border Oranye & Teks Putih
              : 'border-transparent text-gray-400 hover:text-white' // Tidak Aktif
          }`}
        >
          Chapters
        </button>

        <button
          onClick={() => setActiveTab('art')}
          className={`pb-3 text-sm font-bold border-b-[3px] transition-colors relative top-[2px] flex items-center gap-2 ${
            activeTab === 'art' 
              ? 'border-[#FF6740] text-white' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Art 
          {/* Badge Counter */}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'art' ? 'bg-white text-black' : 'bg-[#32353b] text-gray-300'}`}>
            {covers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 text-sm font-bold border-b-[3px] transition-colors relative top-[2px] ${
            activeTab === 'recommendations' 
              ? 'border-[#FF6740] text-white' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Recommendations
        </button>
      </div>

      {/* --- TAB CONTENT --- */}
      
      {/* 1. CHAPTERS TAB */}
      <div className={activeTab === 'chapters' ? 'block' : 'hidden'}>
        {children}
      </div>

      {/* 2. ART TAB */}
      {activeTab === 'art' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in zoom-in-95 duration-300">
            {covers.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500 italic bg-[#1e2025] rounded border border-[#32353b]">No art found.</div>
            ) : (
                covers.map((cover) => (
                    <div key={cover.id} className="group relative aspect-[2/3] rounded-md overflow-hidden bg-[#232529] border border-[#32353b] shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={`https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.256.jpg`} 
                            alt={cover.attributes.volume || "Cover"}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-4">
                            <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                                {cover.attributes.volume ? `Vol. ${cover.attributes.volume}` : 'Cover'}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      )}

      {/* 3. RECOMMENDATIONS TAB */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 animate-in fade-in zoom-in-95 duration-300">
            {recommendations.length === 0 ? (
                // UPDATE: Hapus border dan background, hanya text simple
                <div className="col-span-full text-center py-20 text-gray-500 italic">
                    No recommendations found.
                </div>
            ) : (
                recommendations.map((manga) => {
                    const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
                    const coverFile = manga.relationships.find((r:any) => r.type === 'cover_art')?.attributes?.fileName;
                    const coverImg = coverFile 
                        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` 
                        : 'https://placehold.co/200x300?text=No+Cover';

                    return (
                        <Link key={manga.id} href={`/manga/${manga.id}`} className="group relative aspect-[2/3] rounded-md overflow-hidden bg-[#232529] border border-[#32353b] shadow-md hover:shadow-orange-500/40 transition hover:-translate-y-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={coverImg} 
                                alt={title as string}
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-orange-400 transition">
                                    {title as string}
                                </h4>
                            </div>
                        </Link>
                    )
                })
            )}
        </div>
      )}

    </div>
  );
}