// src/components/MangaSection.tsx
'use client';

import Link from "next/link"; 
import MangaCard from "./MangaCard";
import DraggableScroll from "./DraggableScroll";

export default function MangaSection({ 
  title, 
  icon, 
  data, 
  cardWidth = "w-[160px] md:w-[200px]",
  viewAllHref 
}: { 
  title: string, 
  icon: string, 
  data: any[],
  cardWidth?: string,
  viewAllHref?: string 
}) {
  return (
    <section className="mb-12 md:mb-16">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
            {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">{title}</h2>
        </div>
        {viewAllHref && (
            <Link 
                href={viewAllHref} 
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 transition-all"
                title="View All"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5} 
                    stroke="currentColor" 
                    className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </Link>
        )}
      </div>
      
      <DraggableScroll className="gap-6 px-2">
        {data.map((manga) => (
            <div key={manga.id} className={`${cardWidth} flex-shrink-0 transition-transform hover:scale-[1.02]`}>
                <MangaCard manga={manga} />
            </div>
        ))}
      </DraggableScroll>
    </section>
  );
}