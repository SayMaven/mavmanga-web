// src/app/manga/[id]/page.tsx
import { getMangaDetail, getMangaFeed, getMangaCovers, getMangaRecommendations } from "@/services/mangadex";
import MangaHero from "@/components/manga/MangaHero";
import MangaSidebar from "@/components/manga/MangaSidebar";
import ChapterList from "@/components/manga/ChapterList";
import MangaSidebarContent from "@/components/manga/MangaSidebarContent";
import MangaTabs from "@/components/manga/MangaTabs";

export default async function MangaDetail({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params;
  const sp = await searchParams;

  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;
  const order = (sp.order === 'asc' ? 'asc' : 'desc'); 
  const limit = 100;
  const offset = (page - 1) * limit;

  // --- FETCHING DATA ---
  const [manga, feedData, firstChapterFeed] = await Promise.all([
    getMangaDetail(id),
    getMangaFeed(id, offset, order), // Data untuk List Chapter (Paginasi)
    getMangaFeed(id, 0, 'asc')       // Data KHUSUS untuk tombol Start Reading (Ambil dari awal, limit default biasanya cukup)
  ]);

  const rawChapters = feedData.data;
  const totalChapters = feedData.total;

  if (!manga || !manga.attributes) return <div className="text-white text-center p-20 font-bold text-xl">404: Manga Not Found</div>;

  // --- LOGIKA START READING (GLOBAL) ---
  // Kita cari chapter nomor terkecil dari hasil fetch 'asc' global
  let startReadingId = null;
  
  if (firstChapterFeed.data && firstChapterFeed.data.length > 0) {
      // 1. Urutkan pastikan benar-benar asc
      const sortedGlobal = firstChapterFeed.data.sort((a: any, b: any) => 
          parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter)
      );

      // 2. Ambil nomor chapter paling awal (Misal: "1", "0", atau "0.1")
      const firstNum = sortedGlobal[0].attributes.chapter;

      // 3. Filter semua versi dari chapter nomor tersebut
      const firstChapterVersions = sortedGlobal.filter((ch: any) => ch.attributes.chapter === firstNum);

      // 4. Prioritas Bahasa: ID -> EN -> Random
      const idVersion = firstChapterVersions.find((ch: any) => ch.attributes.translatedLanguage === 'id');
      const enVersion = firstChapterVersions.find((ch: any) => ch.attributes.translatedLanguage === 'en');
      
      startReadingId = idVersion?.id || enVersion?.id || firstChapterVersions[0]?.id;
  }
  // -------------------------------------

  // --- LOGIKA REKOMENDASI ---
  const mainTitle = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "";
  const tags = manga.attributes.tags.filter((t: any) => t.attributes.group === 'genre' || t.attributes.group === 'theme').map((t: any) => t.id);
  const demographic = manga.attributes.publicationDemographic;
  
  const [covers, recommendations] = await Promise.all([
     getMangaCovers(id),
     getMangaRecommendations(mainTitle as string, tags, demographic, id) 
  ]);

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 font-sans pb-20">
      
      {/* Kirim startReadingId yang sudah dihitung secara global */}
      <MangaHero 
        manga={manga} 
        firstChapterId={startReadingId} 
      />

      <div className="container mx-auto px-4 md:px-6 mt-8">
        <MangaTabs mangaId={id} covers={covers} recommendations={recommendations}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 h-fit">
                    <MangaSidebar manga={manga}>
                        <MangaSidebarContent manga={manga} />
                    </MangaSidebar>
                </div>

                <div className="lg:col-span-9">
                    <ChapterList 
                        rawChapters={rawChapters} 
                        totalChapters={totalChapters}
                        currentPage={page}
                        currentOrder={order} 
                    />
                </div>
            </div>
        </MangaTabs>
      </div>
    </main>
  );
}