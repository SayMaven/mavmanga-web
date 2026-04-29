// src/components/library/LibraryContent.tsx
'use client';

import {
  BookOpenIcon, ArrowPathIcon, BookmarkIcon, CheckCircleIcon,
  PauseCircleIcon, XCircleIcon, QueueListIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';

type ReadingStatus = 'reading' | 'on_hold' | 'dropped' | 'plan_to_read' | 'completed' | 're_reading';
type TabId = ReadingStatus | 'all';
type SortKey = 'updated' | 'title' | 'status';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getPreferredTitle = (manga: any): string => {
  if (manga.attributes) {
    const attr = manga.attributes;
    const ogLang = attr.originalLanguage;
    const altTitles = attr.altTitles || [];
    const findTitle = (lang: string) =>
      attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
    const fallback = (typeof attr.title === 'object')
      ? Object.values(attr.title)[0] as string
      : attr.title;
    return (ogLang === 'ja'
      ? findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallback
      : findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallback
    ) || 'Untitled';
  }
  return manga.title || 'Untitled';
};

const STATUS_BADGE: Record<string, string> = {
  reading:      'bg-lime-600/90',
  completed:    'bg-blue-600/90',
  dropped:      'bg-red-600/90',
  re_reading:   'bg-purple-600/90',
  plan_to_read: 'bg-emerald-600/90',
  on_hold:      'bg-yellow-600/90',
};

const STATUS_DOT: Record<string, string> = {
  reading:      'bg-lime-400',
  completed:    'bg-blue-400',
  dropped:      'bg-red-400',
  re_reading:   'bg-purple-400',
  plan_to_read: 'bg-emerald-400',
  on_hold:      'bg-yellow-400',
};

const TABS: { id: TabId; label: string; Icon: any }[] = [
  { id: 'all',          label: 'All',         Icon: QueueListIcon    },
  { id: 'reading',      label: 'Reading',     Icon: BookOpenIcon     },
  { id: 're_reading',   label: 'Re-Reading',  Icon: ArrowPathIcon    },
  { id: 'plan_to_read', label: 'Plan',        Icon: BookmarkIcon     },
  { id: 'completed',    label: 'Done',        Icon: CheckCircleIcon  },
  { id: 'on_hold',      label: 'Hold',        Icon: PauseCircleIcon  },
  { id: 'dropped',      label: 'Dropped',     Icon: XCircleIcon      },
];

// ── Card ──────────────────────────────────────────────────────────────────────
const LibraryCard = memo(function LibraryCard({ manga, onRemove }: { manga: any; onRemove: (id: string) => void }) {
  const title = getPreferredTitle(manga);
  const safeStatus = manga.status || 'unknown';

  return (
    <div className="group relative">
      <Link href={`/manga/${manga.id}`} className="block h-full">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-white/10 group-hover:border-orange-500/50 transition bg-[#191A1C]">
          <img
            src={manga.cover || 'https://placehold.co/300x450/333/999?text=No+Cover'}
            alt={title}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
          />

          {/* Status badge */}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-md text-white backdrop-blur-md ${STATUS_BADGE[safeStatus] || 'bg-gray-700/90'}`}>
            {safeStatus.replace('_', ' ')}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-orange-400 transition">
              {title}
            </h3>
          </div>
        </div>
      </Link>

      {/* Remove button — shown on hover */}
      <button
        onClick={(e) => { e.preventDefault(); onRemove(manga.id); }}
        title="Remove from library"
        className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400/50 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LibraryContent() {
  const [library, setLibrary]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [sortBy, setSortBy]     = useState<SortKey>('updated');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('maven_library');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLibrary(parsed);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: library.length };
    library.forEach(item => { c[item.status] = (c[item.status] || 0) + 1; });
    return c;
  }, [library]);

  const displayed = useMemo(() => {
    let list = activeTab === 'all' ? library : library.filter(m => m.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => getPreferredTitle(m).toLowerCase().includes(q));
    }
    if (sortBy === 'title')  list = [...list].sort((a, b) => getPreferredTitle(a).localeCompare(getPreferredTitle(b)));
    if (sortBy === 'status') list = [...list].sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    if (sortBy === 'updated') list = [...list].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return list;
  }, [library, activeTab, search, sortBy]);

  const handleRemove = useCallback((id: string) => {
    setLibrary(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem('maven_library', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#0f0f11] text-white font-sans pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] py-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              My Library
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your reading list locally.</p>
          </div>

          {/* Tabs (pill style — same as original) */}
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {TABS.map(({ id, label, Icon }) => {
              const count = counts[id] ?? 0;
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                      : 'bg-[#232529] border-white/5 text-gray-400 hover:text-white hover:bg-[#2f3136]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className={`ml-1 text-xs opacity-70 px-1.5 rounded ${isActive ? 'bg-black/20' : 'bg-black/40'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Toolbar: Search + Sort + Status Summary ── */}
        {library.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            {/* Status summary — pill badges */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_DOT).map(([key, dot]) => {
                const count = counts[key] || 0;
                if (!count) return null;
                const label = key.replace(/_/g, ' ');
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-[#232529] border border-white/5 text-gray-300 whitespace-nowrap"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                    {label}
                    <span className="text-xs bg-black/40 px-1.5 rounded opacity-70">{count}</span>
                  </span>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search — pill style */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search title..."
                  className="bg-[#232529] border border-white/5 rounded-full pl-10 pr-9 py-2 text-sm font-bold text-gray-200 focus:border-orange-500/50 outline-none transition w-48 placeholder:text-gray-600 placeholder:font-normal"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sort — pill buttons (same as tabs) */}
              {(['updated', 'title', 'status'] as SortKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                    sortBy === key
                      ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                      : 'bg-[#232529] border-white/5 text-gray-400 hover:text-white hover:bg-[#2f3136]'
                  }`}
                >
                  {key === 'updated' ? 'Recent' : key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Loading library data...</div>
        ) : displayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {displayed.map(manga => (
              <LibraryCard key={manga.id} manga={manga} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-5xl mb-4 grayscale">📂</span>
            <h2 className="text-xl font-bold text-white">
              {search
                ? `No results for "${search}"`
                : `No manga in "${activeTab === 'all' ? 'All' : activeTab.replace(/_/g, ' ')}"`}
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              {search
                ? 'Try a different keyword'
                : activeTab === 'all'
                  ? 'Start adding manga to your library!'
                  : 'Try changing the status filter.'}
            </p>
            {activeTab === 'all' && !search && (
              <Link
                href="/search"
                className="mt-6 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition"
              >
                Browse Manga
              </Link>
            )}
          </div>
        )}

      </div>
    </main>
  );
}