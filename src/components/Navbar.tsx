// src/components/Navbar.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchInput from "./SearchInput";
import Image from "next/image";
import { useState, useEffect, useRef } from "react"; 
import { BookmarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileSearchOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/read')) {
    return null;
  }

  return (
    <nav className="bg-[#191A1C]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 max-w-[1600px] h-16 flex items-center justify-between gap-4 relative">
          <Link 
            href="/" 
            className={`flex items-center gap-2 group flex-shrink-0 mr-auto transition-all duration-300
              ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition flex-shrink-0">
               <div className="w-full h-full rounded-full overflow-hidden relative">
                 <Image
                   src="https://res.cloudinary.com/ds4a54vuy/image/upload/v1770397534/latest.png"
                   alt="Logo"
                   fill
                   sizes="40px"
                   className="object-cover"
                 />
               </div>
            </div>
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-orange-400 transition whitespace-nowrap">
                MavenManga
            </span>
          </Link>

          <div className={`flex items-center gap-3 md:gap-4 justify-end transition-all duration-300
              ${isMobileSearchOpen ? 'w-full absolute left-0 px-4 md:static md:w-auto md:px-0 bg-[#191A1C] md:bg-transparent h-full z-20' : 'flex-none'} 
          `}>
              <div 
                ref={searchRef}
                className={`
                 transition-all duration-300
                 ${isMobileSearchOpen ? 'flex w-full items-center gap-3' : 'hidden md:block'}
              `}
              >
                {isMobileSearchOpen && (
                    <button 
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="md:hidden p-1 text-gray-400 hover:text-white flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                <div className="w-full">
                    <SearchInput autoFocus={isMobileSearchOpen} />
                </div>
              </div>

              {!isMobileSearchOpen && (
                  <button 
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
              )}
              
              <div className={`flex items-center gap-3 md:gap-4 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                
                <Link 
                    href="/library" 
                    className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg font-bold border transition shadow-lg
                    ${pathname === '/library' 
                        ? 'bg-orange-600 border-orange-400 text-white' 
                        : 'bg-gray-800 border-white/10 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    title="My Library"
                >
                   <BookmarkIcon className="h-6 w-6 text-white" />
                </Link>

                <div className="w-10 h-10 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold border border-white/10 hover:border-orange-500 transition cursor-pointer relative overflow-hidden">
                     <Image
                        src="https://res.cloudinary.com/ds4a54vuy/image/upload/v1768230433/What_Lies_Ahead_%28Before_Training%29.jpg"
                        alt="User"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                </div>
              </div>

          </div>
        </div>
    </nav>
  );
}