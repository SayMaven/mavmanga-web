// src/components/SearchInput.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { fetchQuickSearchServer } from '@/app/actions';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [renderDropdown, setRenderDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRenderDropdown(true);
    } else {
      const timer = setTimeout(() => setRenderDropdown(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchQuickResults = async () => {
      if (debouncedQuery.trim().length < 3) return;

      setIsSearching(true);
      try {
        const data = await fetchQuickSearchServer(debouncedQuery);
        setResults(data || []);
      } catch (error) {
        console.error("Quick search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchQuickResults();
  }, [debouncedQuery]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== "") {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getCoverUrl = (manga: any) => {
    const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
    const myProxy = process.env.NEXT_PUBLIC_PROXY;
    const fileName = coverRel?.attributes?.fileName;
    return fileName ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : '';
  };

  const getTitle = (manga: any) => {
    const titleObj = manga.attributes.title;
    const originalLang = manga.attributes.originalLanguage;
    const altTitles = manga.attributes.altTitles || [];

    if (originalLang === 'zh' || originalLang === 'zh-hk' || originalLang === 'ko') {
      const engAltTitle = altTitles.find((alt: any) => alt.en);
      if (engAltTitle) {
        return engAltTitle.en;
      }
    }

    return titleObj.en || Object.values(titleObj)[0] || 'Unknown Title';
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    if (num === 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const isExpanded = isFocused || isOpen;

  return (
    <div className="relative w-full md:flex md:justify-end">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        className={`w-full bg-[#232529] border border-gray-700 rounded-full text-sm pl-4 pr-10 py-2 text-gray-200 outline-none transition-all duration-300 ease-in-out md:w-64 ${isExpanded ? 'md:w-[350px] lg:w-[450px] border-orange-500' : ''}`}
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          if (val.trim().length >= 3) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        onKeyDown={handleSearch}
        onFocus={() => {
          setIsFocused(true);
          if (query.trim().length >= 3) setIsOpen(true);
        }}
        onBlur={() => setIsFocused(false)}
      />

      {query.length > 0 ? (
        <button
          type="button"
          onClick={clearQuery}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 bg-[#FF6740] hover:bg-orange-500 rounded-full text-white transition-colors flex items-center justify-center z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      ) : (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      )}

      {renderDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute top-[calc(100%+8px)] right-0 w-full md:w-[480px] bg-[#191A1C] border border-[#3b3e44] rounded-lg shadow-2xl overflow-hidden z-[100] flex flex-col origin-top-right transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-75 opacity-0 invisible'}`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#1F2125] border-b border-white/5">
            <span className="text-white font-bold text-[15px] tracking-wide">Manga</span>

            <button
              onClick={() => { setIsOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`); }}
              title={`View all results for "${query}"`}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col max-h-[65vh] overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="flex flex-col">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3.5 p-3 border-b border-white/5 last:border-0">
                    <div className="w-[56px] h-[80px] bg-[#2A2D33] rounded animate-pulse flex-shrink-0"></div>
                    <div className="flex flex-col flex-1 justify-center py-1 gap-2.5">
                      <div className="h-3.5 bg-[#2A2D33] rounded w-3/4 animate-pulse"></div>
                      <div className="flex gap-2 mb-1">
                        <div className="h-3 bg-[#2A2D33] rounded w-10 animate-pulse"></div>
                        <div className="h-3 bg-[#2A2D33] rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="mt-auto flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#2A2D33] animate-pulse"></div>
                        <div className="h-2.5 bg-[#2A2D33] rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              results.map((manga) => {
                const stats = manga.statistics;
                const rating = stats?.rating?.average ? Number(stats.rating.average).toFixed(2) : 'N/A';
                const follows = formatNumber(stats?.follows);

                return (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3.5 p-3 hover:bg-[#232529] transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-[56px] h-[80px] flex-shrink-0 bg-[#121212] rounded shadow-md overflow-hidden relative border border-white/5">
                      <img
                        src={getCoverUrl(manga)}
                        alt="cover"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col flex-1 justify-center min-w-0 py-0.5">
                      <h4 className="text-gray-100 font-bold text-[15px] truncate mb-1.5" title={getTitle(manga)}>
                        {getTitle(manga)}
                      </h4>

                      <div className="flex items-center gap-3.5 text-[13px] font-medium text-gray-400 mb-2.5">
                        <span className="flex items-center gap-1 text-[#FF6740]">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                          </svg>
                          {rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                          </svg>
                          {follows}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          N/A
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-auto">
                        <span className={`w-2 h-2 rounded-full shadow-sm
                              ${manga.attributes.status === 'completed' ? 'bg-[#00E5FF]' :
                            manga.attributes.status === 'ongoing' ? 'bg-[#00E676]' :
                              manga.attributes.status === 'hiatus' ? 'bg-yellow-500' : 'bg-gray-500'}`}
                        ></span>
                        <span className="text-[12px] text-gray-300 font-bold capitalize">
                          {manga.attributes.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">No matching manga found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}