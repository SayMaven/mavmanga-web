// src/components/SearchInput.tsx
'use client'; // WAJIB Client Component

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== "") {
      // Redirect ke halaman search dengan parameter ?q=...
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative hidden sm:block">
      <input 
        type="text" 
        placeholder="Search..." 
        className="bg-[#232529] border border-gray-700 rounded-full text-sm px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 w-64 transition-all focus:w-72"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />
      {/* Icon Search (Hiasan) */}
      <svg 
        className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}