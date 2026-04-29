// src/app/page.tsx
import {
  getPopularNew,
  getLatestChapters,
  getRecommended,
  getSeasonal,
  getRecentlyAdded,
  getFirstChapterId
} from "@/services/mangadex";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import LatestUpdateCard from "@/components/LatestUpdateCard";
import MangaSection from "@/components/MangaSection";
import ContentWarning from "@/components/ContentWarning";

// Returns e.g. "Spring 2026" based on current server date
function getSeasonLabel(): string {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  const year = now.getFullYear();
  if (month <= 2)  return `Winter ${year}`;  // Jan–Mar
  if (month <= 5)  return `Spring ${year}`;  // Apr–Jun
  if (month <= 8)  return `Summer ${year}`;  // Jul–Sep
  return `Fall ${year}`;                     // Oct–Dec
}

export default async function Home() {
  const [popular, latestChapters, recommended, seasonal, recent] = await Promise.all([
    getPopularNew(),
    getLatestChapters(),
    getRecommended(),
    getSeasonal(),
    getRecentlyAdded()
  ]);

  // Fetch first chapter IDs for all popular manga in parallel (cached 24h)
  const popularWithChapters = await Promise.all(
    (popular || []).map(async (manga: any) => ({
      ...manga,
      firstChapterId: await getFirstChapterId(manga.id),
    }))
  );

  return (
    <main className="min-h-screen bg-[#0f0f11] text-white font-sans pb-16">

      <ContentWarning />

      {/* Hero — full bleed */}
      <div className="w-full mb-12">
        <HeroCarousel mangaList={popularWithChapters} />
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] space-y-14">

        {/* Latest Updates */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Latest Updates</h2>
              <div className="hidden md:block h-[2px] w-6 bg-orange-500 rounded-full ml-1" />
            </div>
            <Link
              href="/manga/latest"
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
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Grid layout — 2 cols on mobile, more on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-2.5">
            {(latestChapters || []).map((chapter: any) => (
              <LatestUpdateCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </section>

        <MangaSection
          title="Recommended"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
          }
          data={recommended || []}
          cardWidth="w-[160px] md:w-[220px]"
          viewAllHref="/search?sortBy=rating_high"
        />

        <MangaSection
          title={`Seasonal: ${getSeasonLabel()}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          }
          data={seasonal || []}
          cardWidth="w-[140px] md:w-[190px]"
          viewAllHref="/search?sortBy=latest"
        />

        <MangaSection
          title="Recently Added"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
            </svg>
          }
          data={recent || []}
          cardWidth="w-[130px] md:w-[175px]"
          viewAllHref="/search?sortBy=created_new"
        />

      </div>

      <footer className="mt-20 border-t border-white/[0.06] py-10 text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
            <span>Powered by</span>
            <a
              href="https://mangadex.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6740] hover:text-[#ff8566] font-bold transition-colors duration-200 flex items-center gap-1"
            >
              MangaDex
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            MavenManga does not store any files on its server. All contents are provided by non-affiliated third parties.
          </p>
        </div>
      </footer>

    </main>
  );
}