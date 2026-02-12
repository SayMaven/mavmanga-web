// src/components/manga/MangaSidebar.tsx (CLIENT COMPONENT WRAPPER)
'use client';

import { useState } from 'react';
import MangaSidebarContent from './MangaSidebarContent';

export default function MangaSidebar({ manga, children }: { manga: any, children: React.ReactNode }) {
  // State untuk Mobile Expand
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      
      {/* WRAPPER CONTENT:
          - Desktop (lg): Selalu tampil (block) & Full Height
          - Mobile: Default hidden, kecuali isExpanded = true
      */}
      <div className={`space-y-8 text-sm pb-10 w-full lg:block ${isExpanded ? 'block' : 'hidden h-24 overflow-hidden mask-linear lg:h-auto lg:overflow-visible lg:mask-none'}`}>
         {/* Render Content dari Server Component (Passed as Children agar tidak re-render) */}
         {children}
      </div>

      {/* TOMBOL SEE MORE (Mobile Only):
          Hanya muncul di mobile (lg:hidden)
      */}
      <div className="lg:hidden mt-4 border-t border-orange-500/50 pt-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-[#FF6740] hover:bg-[#ff5528] text-white font-bold py-2 rounded uppercase text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-lg"
        >
           {isExpanded ? (
             <>
               Hide <span className="text-lg">▲</span>
             </>
           ) : (
             <>
               See More <span className="text-lg">▼</span>
             </>
           )}
        </button>
      </div>
      
    </div>
  );
}