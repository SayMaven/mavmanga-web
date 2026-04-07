// src/components/SearchContent.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchCard from './SearchCard';
import MangaCard from './MangaCard';
import ContentRatingFilter from './filters/ContentRatingFilter';
import LanguageFilter from './filters/LanguageFilter';
import StatusFilter from './filters/StatusFilter';
import AuthorFilter from './filters/AuthorFilter';
import ArtistFilter from './filters/ArtistFilter';
import TagFilter from './filters/TagFilter';
import TranslatedLanguageFilter from './filters/TranslatedLanguageFilter'; 
import Pagination from './Pagination';
import SortByFilter from './filters/SortByFilter';
import DemographicFilter from './filters/DemographicFilter';

export default function SearchContent({
  initialResults,
  totalResults,
  currentPage
}: {
  initialResults: any[],
  totalResults: number,
  currentPage: number
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'none');
  const [status, setStatus] = useState<string[]>(() => {
    const s = searchParams.get('status');
    return (s && s !== 'any') ? s.split(',') : [];
  });

  const [rating, setRating] = useState<string[]>(() => {
    const r = searchParams.get('rating');
    return (r && r !== 'any') ? r.split(',') : [];
  });

  const [lang, setLang] = useState<string[]>(() => {
    const l = searchParams.get('language');
    return (l && l !== 'any') ? l.split(',') : [];
  });

  const [hasTranslatedChapters, setHasTranslatedChapters] = useState(() => {
    const param = searchParams.get('hasAvailableChapters');
    return param === 'true' || param === null; 
  });

  const [translatedLangs, setTranslatedLangs] = useState<string[]>(() => {
    const l = searchParams.get('availableTranslatedLanguage');
    return l ? l.split(',') : [];
  });

  const [authors, setAuthors] = useState<string[]>(() => {
    const a = searchParams.get('authors'); return (a && a !== '') ? a.split(',') : [];
  });
  const [artists, setArtists] = useState<string[]>(() => {
    const a = searchParams.get('artists'); return (a && a !== '') ? a.split(',') : [];
  });

  const [demo, setDemo] = useState(searchParams.get('demo') || 'any');
  const [year, setYear] = useState(searchParams.get('year') || "");

  const [includedTags, setIncludedTags] = useState<string[]>(() => {
    const t = searchParams.get('includedTags'); return t ? t.split(',') : [];
  });
  const [excludedTags, setExcludedTags] = useState<string[]>(() => {
    const t = searchParams.get('excludedTags'); return t ? t.split(',') : [];
  });
  const [incMode, setIncMode] = useState(searchParams.get('includedTagsMode') || 'AND');
  const [excMode, setExcMode] = useState(searchParams.get('excludedTagsMode') || 'OR');

  const handleTagUpdate = (inc: string[], exc: string[], iMode: string, eMode: string) => {
    setIncludedTags(inc);
    setExcludedTags(exc);
    setIncMode(iMode);
    setExcMode(eMode);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sortBy && sortBy !== 'none') params.set('sortBy', sortBy);
    if (status.length > 0) params.set('status', status.join(','));
    if (rating.length > 0) params.set('rating', rating.join(','));
    if (lang.length > 0) params.set('language', lang.join(','));
    if (authors.length > 0) params.set('authors', authors.join(','));
    if (artists.length > 0) params.set('artists', artists.join(','));
    if (hasTranslatedChapters) {
      params.set('hasAvailableChapters', 'true');
      if (translatedLangs.length > 0) {
        params.set('availableTranslatedLanguage', translatedLangs.join(','));
      }
    } else {
      params.set('hasAvailableChapters', 'false');
    }

    if (includedTags.length > 0) params.set('includedTags', includedTags.join(','));
    if (excludedTags.length > 0) params.set('excludedTags', excludedTags.join(','));
    if (incMode !== 'AND') params.set('includedTagsMode', incMode);
    if (excMode !== 'OR') params.set('excludedTagsMode', excMode);

    if (demo !== 'any') params.set('demo', demo);
    if (year) params.set('year', year);

    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const inputClass = "w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 outline-none h-10";
  const labelClass = "block text-[10px] font-bold text-gray-400 uppercase mb-1.5";

  return (
    <div className="container mx-auto px-4 py-6 max-w-10xl">

      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span onClick={() => router.back()} className="cursor-pointer hover:text-orange-500">←</span>
        Advanced Search
      </h1>

      <div className="bg-[#191A1C] p-4 rounded-lg mb-6 border border-white/5">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search title..."
              className="w-full bg-[#232529] text-white border border-[#3b3e44] rounded pl-10 pr-4 py-2.5 focus:border-orange-500 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white">✕</button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 rounded font-bold text-sm transition flex items-center gap-2 ${showFilters ? 'bg-orange-600 text-white' : 'bg-[#232529] text-gray-300 border border-[#3b3e44]'}`}
          >
            <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
            {showFilters ? '▲' : '▼'}
          </button>
        </div>

        {/* FILTERS GRID */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">

              {/* 1. Sort By */}
              <SortByFilter selectedSort={sortBy} onChange={setSortBy} />

              {/* 2. Filter Tags */}
              <TagFilter
                includedTags={includedTags}
                excludedTags={excludedTags}
                inclusionMode={incMode}
                exclusionMode={excMode}
                onUpdate={handleTagUpdate}
              />

              {/* 3. Content Rating */}
              <ContentRatingFilter selectedRatings={rating} onChange={setRating} />

              {/* 4. Demographic */}
              <DemographicFilter selectedDemo={demo} onChange={setDemo} />

              {/* 5. Authors */}
              <AuthorFilter selectedAuthors={authors} onChange={setAuthors} />

              {/* 6. Artists */}
              <ArtistFilter selectedArtists={artists} onChange={setArtists} />

              {/* 7. Original Language */}
              <LanguageFilter selectedLangs={lang} onChange={setLang} />

              {/* 8. Year */}
              <div>
                <label className={labelClass}>Publication Year</label>
                <input type="number" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
              </div>

              {/* 9. Status */}
              <StatusFilter selectedStatus={status} onChange={setStatus} />

              {/* 10. TRANSLATED CHAPTERS FILTER (NEW COMPONENT) */}
              <TranslatedLanguageFilter
                isEnabled={hasTranslatedChapters}
                onEnableChange={setHasTranslatedChapters}
                selectedLangs={translatedLangs}
                onChange={setTranslatedLangs}
              />

            </div>

            {/* RESET BUTTON */}
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setQuery(""); setSortBy("none"); setStatus([]); setDemo("any");
                  setRating([]); setLang([]); setAuthors([]); setArtists([]); setYear("");
                  setIncludedTags([]); setExcludedTags([]); setIncMode('AND'); setExcMode('OR');
                  setHasTranslatedChapters(true);
                  setTranslatedLangs([]);
                }}
                className="text-sm text-gray-500 hover:text-white px-2"
              >
                Reset filters
              </button>
              <button onClick={handleSearch} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-8 rounded transition shadow-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {initialResults.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-400 text-sm">
            Found <span className="text-white font-bold">{totalResults.toLocaleString()}</span> matches
          </div>
          <div className="flex bg-[#191A1C] p-1 rounded border border-white/5">
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded text-sm font-medium transition ${viewMode === 'list' ? 'bg-[#3b3e44] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>List</button>
            <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 rounded text-sm font-medium transition ${viewMode === 'grid' ? 'bg-[#3b3e44] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Grid</button>
          </div>
        </div>
      )}

      {initialResults.length > 0 ? (
        <>
          <div className={viewMode === 'list'
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
          }>
            {initialResults.map((manga: any) => (
              viewMode === 'list'
                ? <SearchCard key={manga.id} manga={manga} />
                : <MangaCard key={manga.id} manga={manga} large />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalResults={totalResults}
            limit={30}
            basePath="/search"
          />
        </>
      ) : (
        <div className="text-center py-32 opacity-20 text-2xl font-black italic">NO RESULTS FOUND</div>
      )}

    </div>
  );
}