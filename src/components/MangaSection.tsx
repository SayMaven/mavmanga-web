// src/components/MangaSection.tsx
'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import MangaCard from './MangaCard';
import DraggableScroll from './DraggableScroll';

const MangaSection = memo(function MangaSection({
  title,
  icon,
  data,
  cardWidth = 'w-[160px] md:w-[200px]',
  viewAllHref,
}: {
  title: string;
  icon?: React.ReactNode;
  data: any[];
  cardWidth?: string;
  viewAllHref?: string;
}) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="w-5 h-5 text-orange-400 flex-shrink-0 flex items-center justify-center">
              {icon}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{title}</h2>
          <div className="hidden md:block h-[2px] w-6 bg-orange-500 rounded-full ml-1" />
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition-colors duration-200 font-semibold"
          >
            View All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ transform: 'translateZ(0)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        )}
      </div>

      {/* Scrollable cards */}
      <DraggableScroll className="gap-4 px-1">
        {data.map((manga, i) => (
          <div
            key={manga.id}
            className={`${cardWidth} flex-shrink-0`}
            style={{ transform: 'translateZ(0)' }}
          >
            <MangaCard manga={manga} priority={i < 4} />
          </div>
        ))}
      </DraggableScroll>
    </section>
  );
});

export default MangaSection;