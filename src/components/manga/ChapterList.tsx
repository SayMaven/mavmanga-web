// src/components/manga/ChapterList.tsx
'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link"; 
import { useRouter, usePathname, useSearchParams } from "next/navigation"; 
import ChapterRow from "./ChapterRow";
import ChapterIndexModal from "./ChapterIndexModal";
import { getFlagUrl } from "@/utils/chapterUtils"; 

export default function ChapterList({ 
    rawChapters, 
    totalChapters, 
    currentPage,
    currentOrder 
}: { 
    rawChapters: any[], 
    totalChapters: number, 
    currentPage: number,
    currentOrder: 'asc' | 'desc'
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [collapsedVolumes, setCollapsedVolumes] = useState<Set<string>>(new Set());
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set()); 
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);

  const syncReadStatus = useCallback(() => {
      const saved = localStorage.getItem('maven_read_chapters');
      if (saved) {
          try { 
              const parsed = JSON.parse(saved);
              setReadChapters(prev => {
                  if (prev.size === parsed.length && parsed.every((id: string) => prev.has(id))) {
                      return prev;
                  }
                  return new Set(parsed);
              });
          } catch (e) { 
              console.error("Error parsing read history:", e); 
          }
      }
  }, []);

  useEffect(() => {
      syncReadStatus(); 
      window.addEventListener('focus', syncReadStatus);
      window.addEventListener('storage', syncReadStatus);

      return () => {
          window.removeEventListener('focus', syncReadStatus);
          window.removeEventListener('storage', syncReadStatus);
      };
  }, [syncReadStatus]);

  const saveReadStatus = (newSet: Set<string>) => {
      setReadChapters(newSet);
      localStorage.setItem('maven_read_chapters', JSON.stringify(Array.from(newSet)));
  };

  const toggleRead = (e: React.MouseEvent, id: string) => {
      e.preventDefault(); e.stopPropagation();
      const newSet = new Set(readChapters);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      saveReadStatus(newSet);
  };

  const toggleChapterReadGroup = (e: React.MouseEvent, versions: any[]) => {
      e.preventDefault(); e.stopPropagation(); 
      
      const newSet = new Set(readChapters);
      const ids = versions.map(v => v.id);
      
      const isAllRead = ids.every((id) => newSet.has(id));

      if (isAllRead) {
          ids.forEach(id => newSet.delete(id));
      } else {
          ids.forEach(id => newSet.add(id));
      }
      
      saveReadStatus(newSet);
  };

  const markAsRead = (id: string) => {
      if (!readChapters.has(id)) {
          const newSet = new Set(readChapters);
          newSet.add(id);
          saveReadStatus(newSet);
      }
  };

  const confirmMarkAll = () => {
      const newSet = new Set(readChapters);
      rawChapters.forEach(ch => newSet.add(ch.id));
      saveReadStatus(newSet);
      setIsConfirmModalOpen(false); 
  };

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    if (name === 'order') params.set('page', '1');
    return params.toString();
  };

  const handleSortToggle = () => {
      const newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
      router.push(`${pathname}?${createQueryString('order', newOrder)}`, { scroll: false });
  };

  const toggleVolume = (vol: string) => {
      const newSet = new Set(collapsedVolumes);
      if (newSet.has(vol)) newSet.delete(vol);
      else newSet.add(vol);
      setCollapsedVolumes(newSet);
  };

  const toggleChapter = (uniqueKey: string) => {
      const newSet = new Set(collapsedChapters);
      if (newSet.has(uniqueKey)) newSet.delete(uniqueKey);
      else newSet.add(uniqueKey);
      setCollapsedChapters(newSet);
  };

  const groupedData = useMemo(() => {
    if (!rawChapters || !Array.isArray(rawChapters)) return [];
    
    const volGroups: Record<string, Record<string, any[]>> = {};

    rawChapters.forEach((ch) => {
        const vol = ch.attributes.volume || 'none';
        const chapNum = ch.attributes.chapter || "Oneshot";

        if (!volGroups[vol]) volGroups[vol] = {};
        if (!volGroups[vol][chapNum]) volGroups[vol][chapNum] = [];
        
        volGroups[vol][chapNum].push(ch);
    });

    const sortedVolKeys = Object.keys(volGroups).sort((a, b) => {
        if (a === 'none') return 1; 
        if (b === 'none') return -1;
        
        const valA = parseFloat(a);
        const valB = parseFloat(b);
        return currentOrder === 'desc' ? valB - valA : valA - valB;
    });

    return sortedVolKeys.map(volKey => {
        const chapKeys = Object.keys(volGroups[volKey]).sort((a, b) => {
            const valA = parseFloat(a);
            const valB = parseFloat(b);
            if (isNaN(valA) || isNaN(valB)) return 0;
            return currentOrder === 'desc' ? valB - valA : valA - valB;
        });

        return {
            vol: volKey,
            chapters: chapKeys.map(chKey => ({
                chapNum: chKey,
                versions: volGroups[volKey][chKey].sort((a, b) => {
                    const langA = a.attributes.translatedLanguage;
                    const langB = b.attributes.translatedLanguage;
                    if (langA === 'en' && langB !== 'en') return -1;
                    if (langA !== 'en' && langB === 'en') return 1;
                    if (langA === 'id' && langB !== 'id') return -1; 
                    return 0;
                })
            }))
        };
    });
  }, [rawChapters, currentOrder]);

  const LIMIT = 100;
  const totalPages = Math.ceil(totalChapters / LIMIT);
  
  const getPageNumbers = () => {
      const pages = [];
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      end = Math.min(totalPages, start + 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
        
        <ChapterIndexModal 
            isOpen={isIndexModalOpen}
            onClose={() => setIsIndexModalOpen(false)}
            chapters={rawChapters} 
            readChapters={readChapters}
            onToggleRead={toggleRead}
            onMarkRead={markAsRead}
        />

        {isConfirmModalOpen && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-[#1e2025] border border-[#32353b] rounded-lg shadow-2xl w-full max-w-md p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">Mark all as read?</h3>
                        <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </div>
                    <p className="text-gray-300 text-sm mb-8">Are you sure you want to mark all chapters on this page as read?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsConfirmModalOpen(false)} className="px-5 py-2 rounded bg-[#3c3e44] hover:bg-[#4a4d55] text-white font-bold text-sm">No</button>
                        <button onClick={confirmMarkAll} className="px-5 py-2 rounded bg-[#FF6740] hover:bg-[#ff5528] text-white font-bold text-sm shadow-lg shadow-orange-500/20">Yes</button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-wrap items-center justify-between min-h-[40px]">
            <button 
                onClick={handleSortToggle}
                className="bg-[#3c3e44] hover:bg-[#4a4d55] text-gray-200 px-4 py-1.5 rounded text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
                {currentOrder === 'desc' ? 'Descending' : 'Ascending'}
                <svg className={`w-3 h-3 transition-transform ${currentOrder === 'desc' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            <div className="flex items-center gap-2">
                 <button onClick={() => setIsConfirmModalOpen(true)} className="hidden sm:block bg-[#3c3e44] hover:bg-[#4a4d55] text-gray-200 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">Mark all on page as read</button>
                 <button 
                    onClick={() => setIsIndexModalOpen(true)}
                    className="bg-[#3c3e44] hover:bg-[#4a4d55] text-gray-200 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm flex items-center gap-2"
                 >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    Index
                 </button>
            </div>
        </div>

        <div className="w-full flex flex-col gap-2">
            {groupedData.length === 0 ? (
                <div className="p-10 text-center text-gray-500 italic bg-[#1e2025] rounded border border-[#32353b]">No chapters found.</div>
            ) : (
                groupedData.map((group) => {
                    const isVolCollapsed = collapsedVolumes.has(group.vol);
                    const displayVol = group.vol === 'none' ? 'No Volume' : `Volume ${group.vol}`;
                    
                    const firstCh = group.chapters[0]?.chapNum;
                    const lastCh = group.chapters[group.chapters.length - 1]?.chapNum;
                    const rangeText = (firstCh && lastCh && firstCh !== lastCh) 
                        ? `Ch. ${firstCh} - ${lastCh}` 
                        : (firstCh ? `Ch. ${firstCh}` : '');
                    
                    const totalReleases = group.chapters.reduce((acc, curr) => acc + curr.versions.length, 0);

                    return (
                        <div key={group.vol} className="w-full">
                            <div 
                                onClick={() => toggleVolume(group.vol)}
                                className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#232529]/50 transition select-none group/header"
                            >
                                <div className="flex-1 text-left">
                                    <span className="text-white font-bold text-base">{displayVol}</span>
                                </div>
                                <div className="flex-1 text-center">
                                    <span className="text-white font-bold text-base">{rangeText}</span>
                                </div>
                                <div className="flex-1 flex justify-end items-center gap-2 text-white font-bold text-sm">
                                    <span className="text-white font-bold text-base">{totalReleases}</span> 
                                    <svg className={`w-4 h-4 text-white transition-transform duration-300 ${isVolCollapsed ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <div 
                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${!isVolCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                            >
                                <div className="overflow-hidden min-h-0">
                                    
                                    <div className="flex flex-col gap-3 py-2">
                                        {group.chapters.map(({ chapNum, versions }) => {
                                            const uniqueKey = `${group.vol}-${chapNum}`;
                                            const isChCollapsed = collapsedChapters.has(uniqueKey);
                                            const langCounts: Record<string, number> = {};
                                            versions.forEach(v => {
                                                const lang = v.attributes.translatedLanguage;
                                                langCounts[lang] = (langCounts[lang] || 0) + 1;
                                            });
                                            const langSummary = Object.entries(langCounts);

                                            const isAllRead = versions.every(v => readChapters.has(v.id));

                                            return (
                                                <div key={uniqueKey} className="group bg-[#191a1c] rounded overflow-hidden border border-[#32353b] shadow-sm">
                                                    <div 
                                                        onClick={() => toggleChapter(uniqueKey)} 
                                                        className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#232529] transition border-l-4 border-transparent hover:border-orange-500 select-none"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={(e) => toggleChapterReadGroup(e, versions)}
                                                                className="text-gray-500 hover:text-white transition focus:outline-none z-10"
                                                                title={isAllRead ? "Mark all as unread" : "Mark all as read"}
                                                            >
                                                                {isAllRead ? (
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                                ) : (
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                )}
                                                            </button>
                                                            <span className="font-bold text-white text-base">{isNaN(parseFloat(chapNum)) ? chapNum : `Chapter ${chapNum}`}</span>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex items-center gap-2 transition-opacity duration-300 ${isChCollapsed ? 'opacity-100' : 'opacity-0'}`}>
                                                                {langSummary.map(([lang, count]) => (
                                                                    <div key={lang} className="flex items-center gap-1">
                                                                        <div className="w-5.5 h-3.5" title={lang}>
                                                                            <img 
                                                                                src={getFlagUrl(lang) ?? ''} 
                                                                                alt={lang} 
                                                                                className="w-full h-full object-cover rounded-[1px] opacity-80" 
                                                                            />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-white">{count}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <svg className={`w-4 h-4 text-white transition-transform duration-300 ${isChCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </div>

                                                    <div 
                                                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${!isChCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                                    >
                                                        <div className="overflow-hidden min-h-0 bg-[#191a1c]">
                                                            {versions.map((chap: any) => (
                                                                <ChapterRow 
                                                                    key={chap.id} 
                                                                    chap={chap} 
                                                                    chapNum={chapNum}
                                                                    isRead={readChapters.has(chap.id)}
                                                                    onToggleRead={toggleRead}
                                                                    onMarkRead={markAsRead} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 pb-4">
                {currentPage > 1 ? (
                    <Link href={`?${createQueryString('page', (currentPage - 1).toString())}`} className="px-3 py-2 bg-[#232529] border border-[#32353b] rounded hover:bg-[#32353b] text-white text-sm font-bold transition">&laquo; Prev</Link>
                ) : (
                    <span className="px-3 py-2 bg-[#1e2025] border border-[#32353b] rounded text-gray-600 text-sm font-bold cursor-not-allowed">&laquo; Prev</span>
                )}
                
                {getPageNumbers().map(num => (
                    <Link
                        key={num}
                        href={`?${createQueryString('page', num.toString())}`}
                        className={`px-3 py-2 rounded border text-sm font-bold transition ${
                            currentPage === num
                                ? 'bg-[#FF6740] border-[#FF6740] text-white' 
                                : 'bg-[#232529] border-[#32353b] text-gray-300 hover:bg-[#32353b] hover:text-white'
                        }`}
                    >
                        {num}
                    </Link>
                ))}

                {currentPage < totalPages ? (
                    <Link href={`?${createQueryString('page', (currentPage + 1).toString())}`} className="px-3 py-2 bg-[#232529] border border-[#32353b] rounded hover:bg-[#32353b] text-white text-sm font-bold transition">Next &raquo;</Link>
                ) : (
                    <span className="px-3 py-2 bg-[#1e2025] border border-[#32353b] rounded text-gray-600 text-sm font-bold cursor-not-allowed">Next &raquo;</span>
                )}
            </div>
        )}
    </div>
  );
}