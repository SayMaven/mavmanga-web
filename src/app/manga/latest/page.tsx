// src/app/manga/latest/page.tsx
import { getLatestChapters } from "@/services/mangadex";
import LatestUpdateCard from "@/components/LatestUpdateCard";
import Pagination from "@/components/Pagination"; 
import Link from "next/link";
import { Metadata } from "next";
import SearchInput from "@/components/SearchInput";

type SearchParams = Promise<{ page?: string }>;

export const metadata: Metadata = {
  title: "Latest", 
  // Hasil di Browser Tab nanti otomatis menjadi: "Pencarian Manga | SayMaven"
};

export default async function LatestUpdatesPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 30; 

  const latestChapters = await getLatestChapters(limit, currentPage);
  const totalResults = 10000; 

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans pb-20">
      
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] py-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-400 hover:text-white transition text-2xl">
                ←
            </Link>
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    Latest Updates
                </h1>
                <p className="text-gray-400 text-sm mt-1">Chapter Manga yang baru saja diperbarui dari seluruh dunia..</p>
            </div>
        </div>

        {/* --- GRID DIGANTI JADI COLUMNS (MASONRY) --- */}
        {latestChapters.length > 0 ? (
            <>
                {/* PERUBAHAN DI SINI:
                   1. Hapus 'grid' dan 'grid-cols-...'
                   2. Ganti jadi 'columns-...' (Ini bikin urutan Atas -> Bawah)
                   3. gap-6 tetap ada untuk jarak horizontal antar kolom
                */}
                <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 gap-6">
                    {latestChapters.map((chapter: any) => (
                        // WRAPPER ITEM:
                        // 'break-inside-avoid' = Agar kartu tidak terpotong di tengah jalan saat ganti kolom
                        // 'mb-6' = Memberi jarak vertikal antar kartu (pengganti gap-y di grid)
                        <div key={chapter.id} className="break-inside-avoid mb-6">
                            <LatestUpdateCard chapter={chapter} />
                        </div>
                    ))}
                </div>

                {/* PAGINATION */}
                <Pagination 
                    currentPage={currentPage}
                    totalResults={totalResults}
                    limit={limit}
                    basePath="/manga/latest"
                />
            </>
        ) : (
            <div className="text-center py-20 text-gray-500">
                No updates found. Please try again later.
            </div>
        )}

      </div>
    </main>
  );
}