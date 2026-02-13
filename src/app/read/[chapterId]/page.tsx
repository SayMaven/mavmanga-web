// src/app/read/[chapterId]/page.tsx

import { getChapterPages, getMangaFeed, getMangaDetail } from "@/services/mangadex"; 
import ReaderViewer from "@/components/reader/ReaderViewer";

// 1. UPDATE FETCH URL: Tambahkan &includes[]=user
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

export default async function ReadPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;

  const [chapterPages, chapterMeta] = await Promise.all([
    getChapterPages(chapterId),
    getChapterMetaData(chapterId)
  ]);

  if (!chapterPages || !chapterPages.baseUrl) return <div className="text-white">Error loading pages</div>;
  if (!chapterMeta) return <div className="text-white">Error loading metadata</div>;

  const { baseUrl, chapter: pagesData } = chapterPages;
  const { hash, data: files } = pagesData;
  const validFiles = Array.isArray(files) ? files : [];
  const images: string[] = validFiles.map((file: string) => `${baseUrl}/data/${hash}/${file}`);

  const mangaRel = chapterMeta.relationships?.find((r: any) => r.type === 'manga');
  const groupRel = chapterMeta.relationships?.find((r: any) => r.type === 'scanlation_group');
  
  // 2. AMBIL DATA USER DARI RELATIONSHIPS
  const userRel = chapterMeta.relationships?.find((r: any) => r.type === 'user');
  
  const mangaId = mangaRel?.id;
  const groupName = groupRel?.attributes?.name || "No Group";
  // Ambil username, jika tidak ada pakai default
  const userName = userRel?.attributes?.username || "Unknown User"; 

  if (!mangaId) return <div>Manga ID not found</div>;

  const [manga, feed] = await Promise.all([
      getMangaDetail(mangaId),
      getMangaFeed(mangaId, 0, 'asc', 500) 
  ]);

  const titles = manga?.attributes?.title || {};
  const mangaTitle = titles.en || Object.values(titles)[0] || "Unknown Title";

  return (
    <ReaderViewer 
        images={images}
        currentChapter={chapterMeta.attributes} 
        currentChapterId={chapterMeta.id}       
        chapterList={feed.data} 
        mangaId={mangaId}
        mangaTitle={mangaTitle as string}
        scanlationGroup={groupName as string}
        uploaderName={userName as string} // <--- 3. KIRIM PROPS INI
    />
  );
}