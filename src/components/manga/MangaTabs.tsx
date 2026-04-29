// src/components/manga/MangaTabs.tsx
'use client';

import { useState, memo } from 'react';
import Link from 'next/link';

interface MangaTabsProps {
  children: React.ReactNode;
  mangaId: string;
  covers: any[];
  recommendations: any[];
}

const CoverCard = memo(function CoverCard({ cover, mangaId, myProxy }: { cover: any; mangaId: string; myProxy: string }) {
  return (
    <div className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1b1e] border border-white/[0.06] shadow-lg">
      <img
        src={`${myProxy}https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.256.jpg`}
        alt={cover.attributes.volume ? `Vol. ${cover.attributes.volume}` : 'Cover'}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ willChange: 'transform' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
        <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">
          {cover.attributes.volume ? `Vol. ${cover.attributes.volume}` : 'Cover'}
        </span>
      </div>
    </div>
  );
});

const RecCard = memo(function RecCard({ manga, myProxy }: { manga: any; myProxy: string }) {
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] as string;
  const coverFile = manga.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
  const coverImg = coverFile
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
    : 'https://placehold.co/200x300/1a1b1e/444?text=No+Cover';

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1b1e] border border-white/[0.06] shadow-md hover:border-orange-500/40 transition-colors duration-150"
      style={{ transform: 'translateZ(0)' }}
    >
      <img
        src={coverImg}
        alt={title}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ willChange: 'transform' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <h4 className="text-[10px] md:text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors duration-150">
          {title}
        </h4>
      </div>
    </Link>
  );
});

export default function MangaTabs({ children, mangaId, covers, recommendations }: MangaTabsProps) {
  const [activeTab, setActiveTab] = useState<'chapters' | 'art' | 'recommendations'>('chapters');
  const myProxy = process.env.NEXT_PUBLIC_PROXY || '';

  const tabs = [
    { id: 'chapters', label: 'Chapters' },
    { id: 'art', label: 'Art', count: covers.length },
    { id: 'recommendations', label: 'More Like This' },
  ] as const;

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors duration-150 relative top-[1px] flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-orange-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {'count' in tab && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 1. CHAPTERS */}
      <div className={activeTab === 'chapters' ? 'block' : 'hidden'}>
        {children}
      </div>

      {/* 2. ART */}
      {activeTab === 'art' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-in fade-in duration-200">
          {covers.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-600 italic text-sm">
              No art found.
            </div>
          ) : (
            covers.map((cover) => (
              <CoverCard key={cover.id} cover={cover} mangaId={mangaId} myProxy={myProxy} />
            ))
          )}
        </div>
      )}

      {/* 3. RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 animate-in fade-in duration-200">
          {recommendations.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-600 italic text-sm">
              No recommendations found.
            </div>
          ) : (
            recommendations.map((manga) => (
              <RecCard key={manga.id} manga={manga} myProxy={myProxy} />
            ))
          )}
        </div>
      )}
    </div>
  );
}