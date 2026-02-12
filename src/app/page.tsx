// src/app/page.tsx
import { 
  getPopularNew, 
  getLatestChapters, 
  getRecommended, 
  getSeasonal, 
  getRecentlyAdded 
} from "@/services/mangadex";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";

import HeroCarousel from "@/components/HeroCarousel";
import LatestUpdateCard from "@/components/LatestUpdateCard";
import MangaSection from "@/components/MangaSection"; 

export default async function Home() {
  const [popular, latestChapters, recommended, seasonal, recent] = await Promise.all([
    getPopularNew(),
    getLatestChapters(),
    getRecommended(),
    getSeasonal(),
    getRecentlyAdded()
  ]);

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans pb-24">

      {/* 1. HERO CAROUSEL */}
      <div className="w-full mb-14">
          <HeroCarousel mangaList={popular || []} />
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] space-y-16">
        
        {/* 2. LATEST UPDATES */}
        <section>
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                   Latest Updates
                </h2>
                {/* LINK AKTIF UNTUK LATEST UPDATES */}
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
                    // 2. Wrapper PENTING agar kartu tidak terpotong antar kolom
                    <div key={chapter.id} className="break-inside-avoid mb-5">
                        <LatestUpdateCard chapter={chapter} />
                    </div>
                ))}
            </div>
        </section>

        {/* 3. RECOMMENDED */}
        <MangaSection 
            title="Recommended" 
            icon="" 
            data={recommended || []} 
            cardWidth="w-[180px] md:w-[250px]" 
            viewAllHref="/search?sortBy=rating_high" // Link ke Top Rating
        />

        {/* 4. SEASONAL */}
        <MangaSection 
            title="Seasonal: Winter 2026" 
            icon="" 
            data={seasonal || []} 
            cardWidth="w-[150px] md:w-[200px]"
            viewAllHref="/search?sortBy=latest" // Link ke Most Follows
        />

        {/* 5. RECENTLY ADDED */}
        <MangaSection 
            title="Recently Added" 
            icon="" 
            data={recent || []} 
            cardWidth="w-[120px] md:w-[150px]"
            viewAllHref="/search?sortBy=created_new" // Link ke Newest Created
        />

      </div>
    </main>
  );
}