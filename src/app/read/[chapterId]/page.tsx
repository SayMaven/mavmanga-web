// src/app/read/[chapterId]/page.tsx

import { Metadata } from "next";
import { getChapterPages, getMangaFeed, getMangaDetail } from "@/services/mangadex"; 
import ReaderViewer from "@/components/reader/ReaderViewer";

// --- HELPER FETCH METADATA ---
async function getChapterMetaData(chapterId: string) {
  try {
    const res = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga&includes[]=scanlation_group&includes[]=user`, {
      cache: 'no-store' 
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    return null;
  }
}

// --- HELPER LOGIC JUDUL (Sama seperti MangaCard/Hero) ---
function getSmartTitle(manga: any) {
    if (!manga || !manga.attributes) return "Unknown Title";
    
    const attr = manga.attributes;
    const ogLang = attr.originalLanguage;
    const altTitles = attr.altTitles || [];

    const findTitle = (lang: string) => {
        return attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
    };

    const fallbackTitle = Object.values(attr.title)[0] as string || "No Title";
    let mainTitle = "";

    // 1. JEPANG: Romaji -> Inggris -> Kanji
    if (ogLang === 'ja') {
        mainTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallbackTitle;
    } 
    // 2. LAINNYA: English -> Romaji -> Asli
    else {
        mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
    }

    return mainTitle;
}

// --- 1. GENERATE METADATA (JUDUL TAB SERVER SIDE) ---
export async function generateMetadata({ params }: { params: Promise<{ chapterId: string }> }): Promise<Metadata> {
    const { chapterId } = await params;
    const chapter = await getChapterMetaData(chapterId);
    
    if (!chapter) return { title: "Reader" };

    const mangaRel = chapter.relationships?.find((r: any) => r.type === 'manga');
    let mangaTitle = "Manga";

    if (mangaRel?.id) {
        const manga = await getMangaDetail(mangaRel.id);
        mangaTitle = getSmartTitle(manga);
    }

    const chapNum = chapter.attributes?.chapter || "Oneshot";
    
    // Format Awal: 1 | Chapter X - Judul | SayMaven
    // (Next.js otomatis nambahin | SayMaven dari layout, jadi kita return depannya aja)
    return {
        title: `1 | Chapter ${chapNum} - ${mangaTitle}`,
        description: `Read ${mangaTitle} Chapter ${chapNum} online free.`
    };
}

// --- 2. MAIN COMPONENT ---
export default async function ReadPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;

  const [chapterPages, chapterMeta] = await Promise.all([
    getChapterPages(chapterId),
    getChapterMetaData(chapterId)
  ]);

  if (!chapterPages || !chapterPages.baseUrl) return <div className="text-white text-center pt-20">Error loading pages</div>;
  if (!chapterMeta) return <div className="text-white text-center pt-20">Error loading metadata</div>;

  const { baseUrl, chapter: pagesData } = chapterPages;
  const { hash, data: files } = pagesData;
  const validFiles = Array.isArray(files) ? files : [];
  const images: string[] = validFiles.map((file: string) => `${baseUrl}/data/${hash}/${file}`);

  const mangaRel = chapterMeta.relationships?.find((r: any) => r.type === 'manga');
  const groupRel = chapterMeta.relationships?.find((r: any) => r.type === 'scanlation_group');
  const userRel = chapterMeta.relationships?.find((r: any) => r.type === 'user');
  
  const mangaId = mangaRel?.id;
  const groupName = groupRel?.attributes?.name || "No Group";
  const userName = userRel?.attributes?.username || "Unknown User"; 

  if (!mangaId) return <div>Manga ID not found</div>;

  const [manga, feed] = await Promise.all([
      getMangaDetail(mangaId),
      getMangaFeed(mangaId, 0, 'asc', 500) 
  ]);

  // Gunakan Logic Judul Cerdas di sini juga agar konsisten
  const mangaTitle = getSmartTitle(manga);

  return (
    <ReaderViewer 
        images={images}
        currentChapter={chapterMeta.attributes} 
        currentChapterId={chapterMeta.id}       
        chapterList={feed.data} 
        mangaId={mangaId}
        mangaTitle={mangaTitle} // Judul yang sudah difilter (Romaji/En)
        scanlationGroup={groupName as string}
        uploaderName={userName as string} 
    />
  );
}