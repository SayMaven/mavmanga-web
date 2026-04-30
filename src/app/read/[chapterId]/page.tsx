// src/app/read/[chapterId]/page.tsx
import { Metadata } from "next";
import { getMangaFeed, getMangaDetail } from "@/services/mangadex"; 
import ReaderViewer from "@/components/reader/ReaderViewer";

async function getChapterMetaData(chapterId: string) {
  try {
    const myProxy = process.env.NEXT_PUBLIC_PROXY;
    const apiUrl = "https://api.mangadex.org"; 
    const fullTargetUrl = `${apiUrl}/chapter/${chapterId}?includes[]=manga&includes[]=scanlation_group&includes[]=user`;
    const res = await fetch(`${myProxy}${encodeURIComponent(fullTargetUrl)}`, { 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data; 
  } catch (error) { 
    console.error("Error fetching metadata:", error);
    return null; 
  }
}

function getSmartTitle(manga: any) {
    if (!manga?.attributes) return "Unknown Title";
    const { originalLanguage: ogLang, altTitles = [], title } = manga.attributes;
    const findTitle = (lang: string) => title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
    const fallback = Object.values(title)[0] as string || "No Title";
    return ogLang === 'ja' ? (findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallback) : (findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallback);
}

export async function generateMetadata({ params }: { params: Promise<{ chapterId: string }> }): Promise<Metadata> {
    const { chapterId } = await params;
    const chapter = await getChapterMetaData(chapterId);
    if (!chapter) return { title: "Reader" };
    
    const mangaRel = chapter.relationships?.find((r: any) => r.type === 'manga');
    const mangaTitle = mangaRel?.id ? getSmartTitle(await getMangaDetail(mangaRel.id)) : "Manga";
    const chapNum = chapter.attributes?.chapter || "Oneshot";
    return {
      title: `Ch. ${chapNum} — ${mangaTitle} | MavenManga`,
      description: `Read ${mangaTitle} Chapter ${chapNum} online for free on MavenManga.`,
    };
}

export default async function ReadPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapterMeta = await getChapterMetaData(chapterId);
  if (!chapterMeta) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0f0f11] gap-3 text-center px-4">
      <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-gray-400 font-bold">Chapter not found</p>
      <p className="text-gray-600 text-sm">The chapter metadata could not be loaded.</p>
    </div>
  );

  const getRel = (type: string) => chapterMeta.relationships?.find((r: any) => r.type === type);
  const mangaId = getRel('manga')?.id;
  if (!mangaId) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0f0f11] gap-3">
      <p className="text-gray-400 font-bold">Manga reference not found</p>
    </div>
  );

  const [manga, feed] = await Promise.all([getMangaDetail(mangaId), getMangaFeed(mangaId, 0, 'asc', 500)]);

  return (
    <ReaderViewer 
        chapterId={chapterId} currentChapter={chapterMeta.attributes} currentChapterId={chapterMeta.id}       
        chapterList={feed.data} mangaId={mangaId} mangaTitle={getSmartTitle(manga)} 
        scanlationGroup={getRel('scanlation_group')?.attributes?.name || "No Group"}
        scanlationGroupId={getRel('scanlation_group')?.id}
        uploaderName={getRel('user')?.attributes?.username || "Unknown User"} 
    />
  );
}