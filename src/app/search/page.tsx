// src/app/search/page.tsx
import { searchManga } from "@/services/mangadex";
import SearchContent from "@/components/SearchContent";
import SearchInput from "@/components/SearchInput";
import Link from "next/link";

type SearchParams = Promise<{ 
  q?: string; 
  status?: string; 
  demo?: string; 
  rating?: string; 
  sortBy?: string; 
  year?: string; 
  language?: string; 
  hasChapters?: string;
  page?: string; 
  authors?: string;
  artist?: string;
  includedTags?: string;
  excludedTags?: string;
  includedTagsMode?: string;
  excludedTagsMode?: string;
}>;

export default async function SearchPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const currentPage = Number(params.page) || 1;
  
  const response = await searchManga({
    q: params.q,
    status: params.status,
    demographic: params.demo,
    rating: params.rating,
    sortBy: params.sortBy,
    language: params.language,
    year: params.year,
    hasChapters: params.hasChapters,
    page: currentPage,
    authors: params.authors,
    artists: params.artist,
    includedTags: params.includedTags,
    excludedTags: params.excludedTags,
    includedTagsMode: params.includedTagsMode,
    excludedTagsMode: params.excludedTagsMode
  });

  const results = response?.data || [];
  const total = response?.total || 0;

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans">

      <SearchContent 
         initialResults={results} 
         totalResults={total}
         currentPage={currentPage}
      />
    </main>
  );
}