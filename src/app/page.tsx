// src/app/page.tsx
import { 
  getPopularNew, 
  getLatestChapters, 
  getRecommended, 
  getSeasonal, 
  getRecentlyAdded 
} from "@/services/mangadex";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import LatestUpdateCard from "@/components/LatestUpdateCard";
import MangaSection from "@/components/MangaSection"; 
import ContentWarning from "@/components/ContentWarning";

export default async function Home() {
  const [popular, latestChapters, recommended, seasonal, recent] = await Promise.all([
    getPopularNew(),
    getLatestChapters(),
    getRecommended(),
    getSeasonal(),
    getRecentlyAdded()
  ]);

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans pb-10">
      
      <ContentWarning />
      <div className="w-full mb-14">
          <HeroCarousel mangaList={popular || []} />
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] space-y-16">
        
        <section>
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                   Latest Updates
                </h2>
                <Link 
                    href="/manga/latest"
                    className="flex items-center gap-2 text-base text-gray-400 hover:text-white transition font-medium group"
                >
                    View All 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-4 gap-5">
                {(latestChapters || []).map((chapter: any) => (
                    <div key={chapter.id} className="break-inside-avoid mb-5">
                        <LatestUpdateCard chapter={chapter} />
                    </div>
                ))}
            </div>
        </section>

        <MangaSection 
            title="Recommended" 
            icon="" 
            data={recommended || []} 
            cardWidth="w-[180px] md:w-[250px]" 
            viewAllHref="/search?sortBy=rating_high" 
        />

        <MangaSection 
            title="Seasonal: Winter 2026" 
            icon="" 
            data={seasonal || []} 
            cardWidth="w-[150px] md:w-[200px]"
            viewAllHref="/search?sortBy=latest" 
        />

        <MangaSection 
            title="Recently Added" 
            icon="" 
            data={recent || []} 
            cardWidth="w-[120px] md:w-[150px]"
            viewAllHref="/search?sortBy=created_new" 
        />

      </div>

      <footer className="mt-32 border-t border-white/5 py-12 text-center">
        <div className="container mx-auto px-4">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
               <span>Powered by</span>
               <a 
                 href="https://mangadex.org" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-[#FF6740] hover:text-[#ff8566] font-bold transition-colors flex items-center gap-1"
               >
                 MangaDex
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
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