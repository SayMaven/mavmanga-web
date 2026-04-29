// src/components/HeroCarousel.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FLAG_MAP: Record<string, string> = {
  'ja': 'jp', 'ko': 'kr', 'zh': 'cn', 'zh-hk': 'hk', 'en': 'gb', 'id': 'id',
  'fr': 'fr', 'es': 'es', 'pt': 'pt', 'de': 'de', 'ru': 'ru', 'vi': 'vn',
};

const getFlagUrl = (lang: string) => {
  const code = FLAG_MAP[lang];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const AUTOPLAY_INTERVAL = 7000;

// Memoized single slide to prevent unnecessary re-renders
const HeroSlide = memo(function HeroSlide({
  manga,
  index,
  isActive,
  isPrev,
  onClick,
}: {
  manga: any;
  index: number;
  isActive: boolean;
  isPrev: boolean;
  onClick: (id: string) => void;
}) {
  const attr = manga.attributes;
  const title = attr.title.en || Object.values(attr.title)[0] as string || 'No Title';
  const rating = attr.contentRating;
  const originalLang = attr.originalLanguage;
  const flagUrl = getFlagUrl(originalLang);

  let description = 'No description available.';
  if (attr.description) {
    description =
      attr.description.en ||
      attr.description.id ||
      (Object.values(attr.description)[0] as string) ||
      description;
  }
  description = description.replace(/[*_~`#\[\]]/g, '').slice(0, 400);

  const myProxy = process.env.NEXT_PUBLIC_PROXY || '';
  const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const imageUrl = fileName
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
    : 'https://placehold.co/1920x1080/222/999?text=No+Cover';

  const tags = attr.tags.slice(0, 4).map((t: any) => t.attributes.name.en);
  const authorName =
    manga.relationships.find((r: any) => r.type === 'author')?.attributes?.name || 'Unknown';

  // Visibility state: active = shown, isPrev = fading out, otherwise hidden
  const visibility = isActive ? 'opacity-100 z-20' : isPrev ? 'opacity-0 z-10' : 'opacity-0 z-0';

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${visibility}`}
      style={{ willChange: 'opacity' }}
      aria-hidden={!isActive}
    >
      {/* Background image — loaded eagerly for first slide, lazy for rest */}
      <img
        src={imageUrl}
        alt=""
        referrerPolicy="no-referrer"
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'low'}
        decoding={index === 0 ? 'sync' : 'async'}
        className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
        style={{ willChange: 'transform' }}
        draggable={false}
      />

      {/* Gradients — GPU composited layers */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/30 to-[#0a0a0a]"
        style={{ transform: 'translateZ(0)' }}
      />
      <div
        className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/75 to-transparent"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Clickable content layer */}
      <div
        className="absolute inset-0 z-10 h-full cursor-pointer select-none"
        onClick={() => onClick(manga.id)}
      >
        {/* ── MOBILE LAYOUT (< md) ── compact, no scroll, always fits */}
        <div className="md:hidden h-full flex flex-col justify-end px-4 pb-6 pt-20">
          <div className="space-y-2">
            {/* Title — max 2 lines on mobile */}
            <h1 className="text-xl font-black leading-tight drop-shadow-2xl tracking-tight line-clamp-2 text-white">
              {title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
              <span className={`px-1.5 py-0.5 rounded text-white shadow-sm ${
                rating === 'pornographic' ? 'bg-red-600' : 'bg-orange-500'
              }`}>
                {rating === 'pornographic' ? '18+' : rating}
              </span>
              {tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded text-gray-200">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description — max 2 lines on mobile */}
            <p className="text-gray-300 leading-snug text-xs drop-shadow-md line-clamp-2">
              {description}
            </p>

            {/* Author */}
            <p className="text-xs text-white/60 italic">{authorName}</p>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                href={manga.firstChapterId ? `/read/${manga.firstChapterId}` : `/manga/${manga.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-500/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Read Now
              </Link>
              <Link
                href={`/manga/${manga.id}`}
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/15 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Details
              </Link>
            </div>
          </div>
        </div>

        {/* ── DESKTOP LAYOUT (>= md) ── full layout with cover thumbnail */}
        <div className="hidden md:flex h-full items-center">
          <div className="container mx-auto px-10">
            <div className="flex flex-row items-center gap-10 w-full justify-start py-12">

              {/* Cover thumbnail — desktop only */}
              <div
                className="flex-shrink-0 relative shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-30"
                style={{ transform: 'translateZ(0)', willChange: 'transform' }}
              >
              <div className="w-32 h-48 md:w-64 md:h-[400px] rounded-xl overflow-hidden border border-white/15 bg-gray-900 ring-1 ring-white/5">
                <img
                  src={imageUrl}
                  alt={title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'low'}
                  decoding="async"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {flagUrl && (
                  <img
                    src={flagUrl}
                    loading="lazy"
                    className="absolute top-2 right-2 md:top-3 md:right-3 w-6 md:w-8 shadow-md rounded-sm"
                    alt={originalLang}
                  />
                )}
              </div>
              </div>

              {/* Text info — desktop */}
              <div className="flex-1 text-white space-y-5 z-30 w-full text-left max-w-2xl">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black leading-none drop-shadow-2xl tracking-tight text-white">
                    {title}
                  </h1>

                  <div className="flex flex-wrap items-center justify-start gap-1.5 text-xs font-bold uppercase tracking-widest">
                    <span className={`px-2 py-0.5 rounded-md text-white shadow-sm ${
                      rating === 'pornographic' ? 'bg-red-600' : 'bg-orange-500'
                    }`}>
                      {rating === 'pornographic' ? '18+' : rating}
                    </span>
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-white/10 border border-white/15 px-2 py-0.5 rounded-md text-gray-200"
                        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-base drop-shadow-md">
                  {description}
                </p>

                <div className="flex items-center justify-start gap-3">
                  <div className="h-[2px] w-8 bg-orange-500 rounded-full" />
                  <p className="text-base text-white font-semibold opacity-75 italic">{authorName}</p>
                </div>

                <div className="flex items-center justify-start gap-3 pt-1">
                  <Link
                    href={manga.firstChapterId ? `/read/${manga.firstChapterId}` : `/manga/${manga.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-500/30 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Read Now
                  </Link>
                  <Link
                    href={`/manga/${manga.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg border border-white/15 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                    style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transform: 'translateZ(0)' }}
                  >
                    Details
                  </Link>
                </div>
              </div>

              {/* Index watermark */}
              <div className="absolute bottom-6 right-6 text-white font-black text-8xl opacity-[0.06] pointer-events-none select-none tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function HeroCarousel({ mangaList }: { mangaList: any[] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const touchStartX = useRef(0);

  const list = mangaList || [];
  const total = list.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((prev) => {
        setPrevIndex(prev);
        return (index + total) % total;
      });
    },
    [total]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Autoplay
  useEffect(() => {
    if (total <= 1) return;
    autoplayRef.current = setTimeout(goNext, AUTOPLAY_INTERVAL);
    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [activeIndex, goNext, total]);

  const handleSlideClick = useCallback(
    (id: string) => {
      if (!isDragging.current) router.push(`/manga/${id}`);
    },
    [router]
  );

  // Touch/swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = false;
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      isDragging.current = true;
      delta > 0 ? goNext() : goPrev();
    }
  };

  if (total === 0) return null;

  return (
    <section
      className="relative w-full bg-[#0a0a0a] overflow-hidden select-none"
      style={{ height: 'clamp(480px, 60vw, 640px)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Section title */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="container mx-auto px-4 md:px-10 pt-4">
          <h2 className="text-lg md:text-2xl font-black text-white/60 tracking-widest uppercase">
            Popular New Titles
          </h2>
        </div>
      </div>

      {/* Slides */}
      {list.map((manga, i) => (
        <HeroSlide
          key={manga.id}
          manga={manga}
          index={i}
          isActive={i === activeIndex}
          isPrev={i === prevIndex}
          onClick={handleSlideClick}
        />
      ))}

      {/* Nav arrows — only shown on hover */}
      <button
        onClick={goPrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 backdrop-blur-sm"
        style={{ transform: 'translateY(-50%) translateZ(0)', backdropFilter: 'blur(8px)' }}
        aria-label="Previous"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Parent needs group class for arrow hover reveal */}
      <button
        onClick={goNext}
        className="absolute right-3 md:right-6 top-1/2 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100 backdrop-blur-sm"
        style={{ transform: 'translateY(-50%) translateZ(0)', backdropFilter: 'blur(8px)' }}
        aria-label="Next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 z-40 flex gap-2" style={{ transform: 'translateX(-50%) translateZ(0)' }}>
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? 'w-6 h-2 bg-orange-500'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}