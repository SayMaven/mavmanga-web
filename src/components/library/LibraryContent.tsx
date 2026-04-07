// src/components/library/LibraryContent.tsx
'use client'; 

import {
  BookOpenIcon, ArrowPathIcon, BookmarkIcon, CheckCircleIcon, PauseCircleIcon, XCircleIcon, QueueListIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type ReadingStatus = 'reading' | 'on_hold' | 'dropped' | 'plan_to_read' | 'completed' | 're_reading';
const getPreferredTitle = (manga: any) => {
    if (manga.attributes) {
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
    }

    return manga.title || "Untitled";
};

export default function LibraryContent() {
  const [library, setLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'all'>('all');

  useEffect(() => {
    const savedData = localStorage.getItem('maven_library');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
            setLibrary(parsed);
        }
      } catch (e) {
        console.error("Error parsing library data", e);
      }
    }
    setLoading(false);
  }, []);

  const filteredLibrary = activeTab === 'all' 
    ? library 
    : library.filter(item => item.status === activeTab);

  const tabs = [
    { id: 'all', label: 'All', icon: QueueListIcon },
    { id: 'reading', label: 'Reading', icon: BookOpenIcon },
    { id: 're_reading', label: 'Re-Reading', icon: ArrowPathIcon },
    { id: 'plan_to_read', label: 'Plan', icon: BookmarkIcon },
    { id: 'completed', label: 'Done', icon: CheckCircleIcon },
    { id: 'on_hold', label: 'Hold', icon: PauseCircleIcon },
    { id: 'dropped', label: 'Dropped', icon: XCircleIcon },
  ];

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans pb-20">
      
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-4">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    My Library 
                </h1>
                <p className="text-gray-400 text-sm mt-1">Manage your reading list locally.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                            activeTab === tab.id
                            ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                            : 'bg-[#232529] border-white/5 text-gray-400 hover:text-white hover:bg-[#2f3136]'
                        }`}
                        >
                        <Icon className="h-4 w-4" />
                        {tab.label}

                        <span
                            className={`ml-1 text-xs opacity-60 ${
                            activeTab === tab.id ? 'bg-black/20' : 'bg-black/40'
                            } px-1.5 rounded`}
                        >
                            {tab.id === 'all'
                            ? library.length
                            : library.filter(i => i.status === tab.id).length}
                        </span>
                        </button>
                    );
                    })}
            </div>
        </div>

        {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Loading library data...</div>
        ) : filteredLibrary.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredLibrary.map((manga) => {
                    const safeStatus = manga.status || 'unknown'; 
                    
                    const displayTitle = getPreferredTitle(manga);

                    return (
                        <div key={manga.id} className="group relative">
                            <Link href={`/manga/${manga.id}`} className="block h-full">
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-white/10 group-hover:border-orange-500/50 transition bg-[#191A1C]">
                                    <img 
                                        src={manga.cover || 'https://placehold.co/300x450/333/999?text=No+Cover'} 
                                        alt={displayTitle}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                                    />
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-md text-white backdrop-blur-md
                                        ${safeStatus === 'reading' ? 'bg-lime-600/90' : 
                                          safeStatus === 'completed' ? 'bg-blue-600/90' : 
                                          safeStatus === 'dropped' ? 'bg-red-600/90' : 
                                          safeStatus === 're_reading' ? 'bg-purple-600/90' : 
                                          safeStatus === 'plan_to_read' ? 'bg-emerald-600/90':
                                          safeStatus === 'on_hold' ? 'bg-yellow-600/90' : ''
                                        }`}>
                                        {safeStatus.replace('_', ' ')}
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                                    
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-orange-400 transition">
                                            {displayTitle}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-50 text-center">
                <span className="text-5xl mb-4 grayscale">📂</span>
                <h2 className="text-xl font-bold text-white">No manga in "{activeTab.replace('_', ' ')}"</h2>
                <p className="text-gray-400 mt-2 text-sm">
                    {activeTab === 'all' ? "Start adding manga to your library!" : "Try changing the status filter."}
                </p>
                {activeTab === 'all' && (
                    <Link href="/search?q=" className="mt-6 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition">
                        Browse Manga
                    </Link>
                )}
            </div>
        )}

      </div>
    </main>
  );
}