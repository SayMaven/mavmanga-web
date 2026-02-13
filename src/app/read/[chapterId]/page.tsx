// src/app/read/[chapterId]/page.tsx
import { getChapterPages, getMangaFeed, getMangaDetail } from "@/services/mangadex"; 
import ReaderViewer from "@/components/reader/ReaderViewer";

// Helper fetch metadata chapter (Title, MangaID, Number)
async function getChapterMetaData(chapterId: string) {
  try {
    const res = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga&includes[]=scanlation_group`, {
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

  // 1. Ambil Data Gambar & Metadata Chapter
  const [chapterPages, chapterMeta] = await Promise.all([
    getChapterPages(chapterId),
    getChapterMetaData(chapterId)
  ]);

  // Validasi Error: Jika data kosong, tampilkan pesan error
  if (!chapterPages || !chapterPages.baseUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">
        Gagal memuat gambar (API Error atau Rate Limit).
      </div>
    );
  }

  if (!chapterMeta) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">
        Chapter Metadata tidak ditemukan.
      </div>
    );
  }

  // 2. Susun URL Gambar (FIXING BAGIAN INI)
  const { baseUrl, chapter: pagesData } = chapterPages;
  const { hash, data: files } = pagesData;
  
  // --- PERBAIKAN UTAMA: Validasi Array & Tipe Data ---
  // Pastikan 'files' benar-benar array. Jika tidak, pakai array kosong biar gak crash.
  const validFiles = Array.isArray(files) ? files : [];
  
  // Explicitly cast ke string[] agar TypeScript TIDAK MERAH
  const images: string[] = validFiles.map((file: string) => `${baseUrl}/data/${hash}/${file}`);
  // ----------------------------------------------------

  // 3. Extract Info (Manga & Group)
  const mangaRel = chapterMeta.relationships?.find((r: any) => r.type === 'manga');
  const groupRel = chapterMeta.relationships?.find((r: any) => r.type === 'scanlation_group');
  
  const mangaId = mangaRel?.id;
  // Pastikan groupName selalu string
  const groupName = groupRel?.attributes?.name || "No Group"; 

  if (!mangaId) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Manga ID not found.</div>;
  }

  // 4. Ambil Detail Manga & Feed (Limit 500)
  const [manga, feed] = await Promise.all([
      getMangaDetail(mangaId),
      // Pastikan src/services/mangadex.ts sudah update menerima parameter limit
      getMangaFeed(mangaId, 0, 'asc', 500) 
  ]);

  // --- LOGIKA JUDUL YANG LEBIH AMAN ---
  const titles = manga?.attributes?.title || {};
  const mangaTitle = titles.en || Object.values(titles)[0] || "Unknown Title";

  return (
    <ReaderViewer 
        images={images} // <-- Sekarang ini pasti string[], jadi tidak akan merah
        currentChapter={chapterMeta.attributes} 
        currentChapterId={chapterMeta.id}       
        chapterList={feed.data} 
        mangaId={mangaId}
        mangaTitle={mangaTitle as string}
        scanlationGroup={groupName as string} 
    />
  );
}