// src/app/search/page.tsx
import { searchManga } from "@/services/mangadex";
import SearchContent from "@/components/SearchContent";
import { Metadata } from "next";

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
  availableTranslatedLanguage?: string; 
}>;

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await props.searchParams;
  const q = params.q;
  return {
    title: q ? `Search: "${q}" — MavenManga` : 'Advanced Search — MavenManga',
    description: q
      ? `Search results for "${q}" on MavenManga`
      : 'Search and filter manga by title, genre, author, status and more on MavenManga.',
  };
}

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
    excludedTagsMode: params.excludedTagsMode,
    availableTranslatedLanguage: params.availableTranslatedLanguage
  });

  const results = response?.data || [];
  const total = response?.total || 0;

  return (
    <main className="min-h-screen bg-[#0f0f11] text-white font-sans">
      <SearchContent
        initialResults={results}
        totalResults={total}
        currentPage={currentPage}
      />
    </main>
  );
}