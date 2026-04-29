// src/components/manga/MangaHero.tsx
'use client';

import Link from 'next/link';
import { memo } from 'react';
import LibraryButton from './LibraryButton';

const getPreferredTitle = (attr: any) => {
  const ogLang = attr.originalLanguage;
  const altTitles = attr.altTitles || [];
  const findTitle = (lang: string) =>
    attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
  const fallback = Object.values(attr.title)[0] as string;

  let mainTitle = '';
  let subTitle = '';

  if (ogLang === 'ja') {
    mainTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallback;
    subTitle = findTitle('ja') || '';
  } else {
    mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallback;
    subTitle = findTitle(ogLang) || '';
  }

  if (!subTitle || mainTitle === subTitle) {
    subTitle = mainTitle === findTitle('en')
      ? findTitle(`${ogLang}-ro`) || ''
      : findTitle('en') || '';
    if (mainTitle === subTitle) subTitle = '';
  }

  return { mainTitle, subTitle };
};

// Lightweight markdown-to-plaintext for description
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '• ')
    .trim();
}

const RATING_CLASS: Record<string, string> = {
  safe:         'bg-emerald-600/80 text-white',
  suggestive:   'bg-orange-500/80 text-white',
  erotica:      'bg-red-600/80 text-white',
  pornographic: 'bg-red-700/80 text-white',
};

const TAG_CLASS = 'bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-gray-300 hover:text-white px-2 py-0.5 rounded text-[10px] font-semibold transition-colors duration-150 cursor-pointer inline-block';
const DOUJIN_TAG_CLASS = 'bg-purple-600/80 hover:bg-purple-500/80 text-white px-2 py-0.5 rounded text-[10px] font-semibold transition-colors duration-150 cursor-pointer inline-block';

const TagChip = memo(({ tag }: { tag: any }) => (
  <Link href={`/search?includedTags=${tag.id}`}>
    <span className={tag.attributes.name.en.toLowerCase() === 'doujinshi' ? DOUJIN_TAG_CLASS : TAG_CLASS}>
      {tag.attributes.name.en}
    </span>
  </Link>
));
TagChip.displayName = 'TagChip';

export default function MangaHero({
  manga,
  firstChapterId,
}: {
  manga: any;
  firstChapterId: string | null;
}) {
  const attr = manga.attributes;
  const { mainTitle, subTitle } = getPreferredTitle(attr);
  const description = stripMarkdown(attr.description?.en || attr.description?.id || '');

  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const myProxy = process.env.NEXT_PUBLIC_PROXY;
  const coverUrl = coverRel?.attributes?.fileName
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.512.jpg`
    : `https://placehold.co/300x450/1a1b1e/444?text=No+Cover`;

  const author = manga.relationships.find((r: any) => r.type === 'author')?.attributes?.name || 'Unknown';
  const artist = manga.relationships.find((r: any) => r.type === 'artist')?.attributes?.name || 'Unknown';
  const genres  = attr.tags.filter((t: any) => t.attributes.group === 'genre');
  const themes  = attr.tags.filter((t: any) => t.attributes.group === 'theme');
  const formats = attr.tags.filter((t: any) => t.attributes.group === 'format');
  const contentRating = attr.contentRating || 'safe';
  const ratingClass = RATING_CLASS[contentRating] || 'bg-gray-600 text-white';

  const handleStartReading = () => {
    if (!firstChapterId) return;
    try {
      const saved = localStorage.getItem('maven_read_chapters');
      const readSet = saved ? new Set(JSON.parse(saved)) : new Set();
      readSet.add(firstChapterId);
      localStorage.setItem('maven_read_chapters', JSON.stringify(Array.from(readSet)));
    } catch { /* non-critical */ }
  };

  return (
    <div className="relative mb-8">
      {/* ── Banner background ── */}
      <div
        className="absolute inset-0 h-[420px] md:h-[500px] overflow-hidden z-0"
        aria-hidden="true"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/75 to-[#0f0f11]/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f11]/60 to-transparent z-10 hidden md:block" />
        <img
          src={coverUrl}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover object-[50%_25%] opacity-40 scale-105"
          style={{ filter: 'blur(8px)', willChange: 'transform' }}
          alt=""
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-20 container mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {/* Cover thumbnail */}
          <div
            className="flex-shrink-0 mx-auto md:mx-0"
            style={{ transform: 'translateZ(0)' }}
          >
            <div className="w-[160px] md:w-[220px] aspect-[2/3] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10 bg-[#1a1b1e]">
              <img
                src={coverUrl}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover"
                alt={mainTitle}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col min-w-0 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-lg mb-1">
              {mainTitle}
            </h1>
            {subTitle && (
              <p className="text-sm md:text-base text-gray-400 mb-3 font-medium">{subTitle}</p>
            )}

            {/* Author / Artist */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-semibold text-gray-400 mb-5">
              <span>
                <span className="text-orange-400">Author:</span>{' '}
                <span className="text-gray-200">{author}</span>
              </span>
              {artist !== author && (
                <span>
                  <span className="text-orange-400">Artist:</span>{' '}
                  <span className="text-gray-200">{artist}</span>
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-5">
              {firstChapterId ? (
                <Link
                  href={`/read/${firstChapterId}`}
                  onClick={handleStartReading}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-orange-500/25 transition-colors duration-150 text-sm"
                  style={{ transform: 'translateZ(0)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Start Reading
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-gray-700/50 text-gray-500 px-6 py-2.5 rounded-lg font-bold cursor-not-allowed text-sm"
                >
                  No Chapters
                </button>
              )}
              <LibraryButton manga={manga} />
            </div>

            {/* Tags / badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ratingClass}`}>
                {contentRating === 'pornographic' ? '18+' : contentRating}
              </span>
              {formats.map((tag: any) => <TagChip key={tag.id} tag={tag} />)}
              {[...genres, ...themes].slice(0, 15).map((tag: any) => <TagChip key={tag.id} tag={tag} />)}
              <span className="flex items-center gap-1.5 ml-1 text-[10px] text-gray-500 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                {attr.year || 'N/A'} · {attr.status}
              </span>
            </div>

            {/* Description — plain text, no heavy markdown library */}
            {description && (
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-5 md:line-clamp-none">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}