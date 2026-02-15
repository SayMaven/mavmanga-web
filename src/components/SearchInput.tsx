// src/components/SearchInput.tsx
'use client'; 

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function SearchInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect untuk memicu keyboard muncul otomatis di HP
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50); 
    }
  }, [autoFocus]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus(); 
  };

  return (
    <div className="relative w-full">
      <input 
        ref={inputRef}
        type="text" 
        placeholder="Search..." 
        className="w-full bg-[#232529] border border-gray-700 rounded-full text-sm pl-4 pr-10 py-2 text-gray-200 focus:outline-none focus:border-orange-500 transition-all duration-300 ease-in-out md:w-64 md:focus:w-80 lg:focus:w-96"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />

      {/* Kondisional Icon */}
      {query.length > 0 ? (
        // Tombol Clear (X)
        <button
          type="button"
          onClick={clearQuery}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 bg-[#FF6740] hover:bg-[#ff5528] rounded-full text-white transition-colors flex items-center justify-center"
          title="Clear search"
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
             <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
           </svg>
        </button>
      ) : (
        // Ikon Search Biasa
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
             </svg>
        </div>
      )}
    </div>
  );
}