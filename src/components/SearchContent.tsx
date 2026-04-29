// src/components/SearchContent.tsx
'use client';

import { useState, useCallback, useTransition, memo } from 'react';
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

const inputClass = 'w-full bg-[#1a1b1e] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-orange-500/70 focus:bg-[#1f2024] outline-none h-10 transition-colors duration-150 placeholder:text-gray-600';
const labelClass = 'block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5';

function SearchContent({
  initialResults,
  totalResults,
  currentPage,
}: {
  initialResults: any[];
  totalResults: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Collapse filters by default on mobile (detect via window if needed, default true on server)
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [query, setQuery]   = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'none');

  const [status, setStatus] = useState<string[]>(() => {
    const s = searchParams.get('status');
    return s && s !== 'any' ? s.split(',') : [];
  });
  const [rating, setRating] = useState<string[]>(() => {
    const r = searchParams.get('rating');
    return r && r !== 'any' ? r.split(',') : [];
  });
  const [lang, setLang] = useState<string[]>(() => {
    const l = searchParams.get('language');
    return l && l !== 'any' ? l.split(',') : [];
  });
  const [hasTranslatedChapters, setHasTranslatedChapters] = useState(() => {
    const p = searchParams.get('hasAvailableChapters');
    return p === 'true' || p === null;
  });
  const [translatedLangs, setTranslatedLangs] = useState<string[]>(() => {
    const l = searchParams.get('availableTranslatedLanguage');
    return l ? l.split(',') : [];
  });
  const [authors, setAuthors] = useState<string[]>(() => {
    const a = searchParams.get('authors');
    return a && a !== '' ? a.split(',') : [];
  });
  const [artists, setArtists] = useState<string[]>(() => {
    const a = searchParams.get('artists');
    return a && a !== '' ? a.split(',') : [];
  });
  const [demo, setDemo] = useState(searchParams.get('demo') || 'any');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [includedTags, setIncludedTags] = useState<string[]>(() => {
    const t = searchParams.get('includedTags'); return t ? t.split(',') : [];
  });
  const [excludedTags, setExcludedTags] = useState<string[]>(() => {
    const t = searchParams.get('excludedTags'); return t ? t.split(',') : [];
  });
  const [incMode, setIncMode] = useState(searchParams.get('includedTagsMode') || 'AND');
  const [excMode, setExcMode] = useState(searchParams.get('excludedTagsMode') || 'OR');

  const handleTagUpdate = useCallback((inc: string[], exc: string[], iMode: string, eMode: string) => {
    setIncludedTags(inc);
    setExcludedTags(exc);
    setIncMode(iMode);
    setExcMode(eMode);
  }, []);

  const handleSearch = useCallback(() => {
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
      if (translatedLangs.length > 0) params.set('availableTranslatedLanguage', translatedLangs.join(','));
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
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }, [query, sortBy, status, rating, lang, authors, artists, hasTranslatedChapters,
      translatedLangs, includedTags, excludedTags, incMode, excMode, demo, year, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleReset = useCallback(() => {
    setQuery(''); setSortBy('none'); setStatus([]); setDemo('any');
    setRating([]); setLang([]); setAuthors([]); setArtists([]); setYear('');
    setIncludedTags([]); setExcludedTags([]); setIncMode('AND'); setExcMode('OR');
    setHasTranslatedChapters(true); setTranslatedLangs([]);
  }, []);

  const activeFilterCount = [
    sortBy !== 'none' ? sortBy : '',
    ...status, ...rating, ...lang, ...authors, ...artists,
    year, demo !== 'any' ? demo : '',
    ...includedTags, ...excludedTags,
    !hasTranslatedChapters ? 'noChap' : '',
    ...translatedLangs,
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px]">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/[0.06] transition-colors text-gray-400 hover:text-white flex-shrink-0"
          style={{ transform: 'translateZ(0)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Advanced Search</h1>
        {activeFilterCount > 0 && (
          <span className="flex-shrink-0 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* ── SEARCH BAR + FILTER TOGGLE ── */}
      <div className="bg-[#16171a] rounded-xl border border-white/[0.06] mb-5 shadow-xl shadow-black/20">

        {/* Search row */}
        <div className="flex gap-2 p-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isPending ? (
                <svg className="w-4 h-4 text-orange-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search title, author..."
              className="w-full bg-[#1a1b1e] text-white border border-white/[0.08] rounded-lg pl-10 pr-10 py-2.5 focus:border-orange-500/70 focus:bg-[#1f2024] outline-none text-sm transition-colors placeholder:text-gray-600"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 px-3 md:px-4 rounded-lg font-bold text-xs md:text-sm transition-colors duration-150 flex items-center gap-1.5 border ${
              showFilters
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                : 'bg-white/[0.04] text-gray-400 border-white/[0.08] hover:border-white/15 hover:text-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-black px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={isPending}
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2 px-4 md:px-6 rounded-lg transition-colors duration-150 flex items-center gap-1.5 text-sm shadow-lg shadow-orange-500/20"
            style={{ transform: 'translateZ(0)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="border-t border-white/[0.06] p-3 pt-3 relative z-50 overflow-visible">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3 overflow-visible">
              <SortByFilter selectedSort={sortBy} onChange={setSortBy} />
              <TagFilter
                includedTags={includedTags}
                excludedTags={excludedTags}
                inclusionMode={incMode}
                exclusionMode={excMode}
                onUpdate={handleTagUpdate}
              />
              <ContentRatingFilter selectedRatings={rating} onChange={setRating} />
              <DemographicFilter selectedDemo={demo} onChange={setDemo} />
              <AuthorFilter selectedAuthors={authors} onChange={setAuthors} />
              <ArtistFilter selectedArtists={artists} onChange={setArtists} />
              <LanguageFilter selectedLangs={lang} onChange={setLang} />
              <div>
                <label className={labelClass}>Publication Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={inputClass}
                />
              </div>
              <StatusFilter selectedStatus={status} onChange={setStatus} />
              <TranslatedLanguageFilter
                isEnabled={hasTranslatedChapters}
                onEnableChange={setHasTranslatedChapters}
                selectedLangs={translatedLangs}
                onChange={setTranslatedLangs}
              />
            </div>

            {/* Bottom bar: reset + search */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset filters
              </button>
              <button
                onClick={handleSearch}
                disabled={isPending}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RESULTS HEADER ── */}
      {initialResults.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-500 text-xs md:text-sm">
            Found{' '}
            <span className="text-white font-bold">{totalResults.toLocaleString()}</span>
            {' '}result{totalResults !== 1 ? 's' : ''}
          </p>

          {/* View mode toggle */}
          <div className="flex bg-[#16171a] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-2 rounded-md transition-colors duration-150 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 rounded-md transition-colors duration-150 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {initialResults.length > 0 ? (
        <>
          <div
            className={
              viewMode === 'list'
                ? 'flex flex-col gap-2.5'
                : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'
            }
          >
            {initialResults.map((manga: any, i: number) =>
              viewMode === 'list'
                ? <SearchCard key={manga.id} manga={manga} priority={i < 4} />
                : <MangaCard key={manga.id} manga={manga} priority={i < 6} />
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalResults={totalResults}
            limit={30}
            basePath="/search"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 font-black text-xl italic tracking-wide uppercase">No results found</p>
          <p className="text-gray-700 text-sm">Try adjusting your search filters</p>
        </div>
      )}

    </div>
  );
}

export default memo(SearchContent);