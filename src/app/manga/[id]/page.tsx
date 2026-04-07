// src/app/manga/[id]/page.tsx
import { Metadata } from "next"; 
import { getMangaDetail, getMangaFeed, getMangaCovers, getMangaRecommendations } from "@/services/mangadex";
import MangaHero from "@/components/manga/MangaHero";
import MangaSidebar from "@/components/manga/MangaSidebar";
import ChapterList from "@/components/manga/ChapterList";
import MangaSidebarContent from "@/components/manga/MangaSidebarContent";
import MangaTabs from "@/components/manga/MangaTabs";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const manga = await getMangaDetail(id);

  if (!manga || !manga.attributes) {
    return { title: "Manga Not Found" };
  }

  const attr = manga.attributes;
  const ogLang = attr.originalLanguage;
  const altTitles = attr.altTitles || [];

  const findTitle = (lang: string) => {
      return attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
  };

  const fallbackTitle = Object.values(attr.title)[0] as string || "Manga Detail";
  let displayTitle = "";

  if (ogLang === 'ja') {
      displayTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallbackTitle;
  } 
  else {
      displayTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
  }

  return {
    title: displayTitle, 
    description: `Baca manga ${displayTitle} bahasa Indonesia gratis di SayMaven.`,
  };
}

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

  const [manga, feedData, firstChapterFeed] = await Promise.all([
    getMangaDetail(id),
    getMangaFeed(id, offset, order), 
    getMangaFeed(id, 0, 'asc')       
  ]);

  const rawChapters = feedData.data;
  const totalChapters = feedData.total;

  if (!manga || !manga.attributes) return <div className="text-white text-center p-20 font-bold text-xl">404: Manga Not Found</div>;

  let startReadingId = null;
  
  if (firstChapterFeed.data && firstChapterFeed.data.length > 0) {
      const sortedGlobal = firstChapterFeed.data.sort((a: any, b: any) => 
          parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter)
      );

      const firstNum = sortedGlobal[0].attributes.chapter;
      const firstChapterVersions = sortedGlobal.filter((ch: any) => ch.attributes.chapter === firstNum);

      const idVersion = firstChapterVersions.find((ch: any) => ch.attributes.translatedLanguage === 'id');
      const enVersion = firstChapterVersions.find((ch: any) => ch.attributes.translatedLanguage === 'en');
      
      startReadingId = idVersion?.id || enVersion?.id || firstChapterVersions[0]?.id;
  }

  const attr = manga.attributes;
  const ogLang = attr.originalLanguage;
  const altTitles = attr.altTitles || [];
  const findTitle = (lang: string) => attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
  
  let searchTitle = "";
  if (ogLang === 'ja') searchTitle = findTitle('ja-ro') || findTitle('en') || Object.values(attr.title)[0] as string;
  else searchTitle = findTitle('en') || Object.values(attr.title)[0] as string;

  const tags = attr.tags.filter((t: any) => t.attributes.group === 'genre' || t.attributes.group === 'theme').map((t: any) => t.id);
  const demographic = attr.publicationDemographic;
  
  const [covers, recommendations] = await Promise.all([
     getMangaCovers(id),
     getMangaRecommendations(searchTitle, tags, demographic, id) 
  ]);

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 font-sans pb-20">
      
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