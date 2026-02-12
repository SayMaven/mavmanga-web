// src/components/Pagination.tsx
'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  limit?: number;
  basePath?: string; // <--- PROP BARU (Opsional)
}

export default function Pagination({ 
  currentPage, 
  totalResults, 
  limit = 30,
  basePath = "/search" // <--- Default ke /search kalau tidak diisi
}: PaginationProps) {
  const totalPages = Math.ceil(totalResults / limit);
  const searchParams = useSearchParams();

  // Helper untuk membuat URL halaman
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    // GUNAKAN basePath DI SINI, BUKAN HARDCODE '/search'
    return `${basePath}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) { start = 2; end = 4; }
        if (currentPage >= totalPages - 2) { start = totalPages - 3; end = totalPages - 1; }

        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-10 mb-20 select-none">
      {/* Prev Button */}
      {currentPage > 1 ? (
        <Link href={createPageUrl(currentPage - 1)} className="px-3 py-2 bg-[#232529] hover:bg-[#3b3e44] rounded text-white transition">
           ←
        </Link>
      ) : (
        <span className="px-3 py-2 bg-[#191A1C] text-gray-600 rounded cursor-not-allowed">←</span>
      )}

      {/* Numbers */}
      {getPageNumbers().map((page, idx) => (
         typeof page === 'number' ? (
           <Link 
             key={idx} 
             href={createPageUrl(page)}
             className={`w-10 h-10 flex items-center justify-center rounded font-bold text-sm transition ${
                currentPage === page 
                  ? 'bg-orange-600 text-white shadow-lg scale-105' 
                  : 'bg-[#232529] text-gray-400 hover:bg-[#3b3e44] hover:text-white'
             }`}
           >
             {page}
           </Link>
         ) : (
           <span key={idx} className="text-gray-500 px-1">...</span>
         )
      ))}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link href={createPageUrl(currentPage + 1)} className="px-3 py-2 bg-[#232529] hover:bg-[#3b3e44] rounded text-white transition">
           →
        </Link>
      ) : (
        <span className="px-3 py-2 bg-[#191A1C] text-gray-600 rounded cursor-not-allowed">→</span>
      )}
    </div>
  );
}