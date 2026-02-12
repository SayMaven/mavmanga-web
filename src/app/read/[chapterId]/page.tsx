// src/app/read/[chapterId]/page.tsx
import { getChapterPages } from "@/services/mangadex";
import Link from "next/link";

export default async function ReadPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;

  // 1. Ambil Data Gambar
  const chapterData = await getChapterPages(chapterId);

  if (!chapterData || !chapterData.baseUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        <h1>Gagal memuat gambar. Coba refresh atau cek koneksi.</h1>
      </div>
    );
  }

  // 2. Susun URL Gambar
  // Format: {baseUrl}/data/{hash}/{filename}
  const { baseUrl, chapter } = chapterData;
  const { hash, data: files } = chapter; // 'data' = High Quality, 'dataSaver' = Low Quality

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      
      {/* --- FLOATING HEADER (Navigasi) --- */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 z-50 flex justify-between items-center border-b border-gray-800 transition-opacity opacity-0 hover:opacity-100 duration-300">
        <Link 
           href="/" // Nanti idealnya balik ke halaman Manga Detail, tapi sementara ke Home dulu atau Back Browser
           className="text-sm font-bold text-gray-300 hover:text-orange-500 flex items-center gap-2"
        >
          ← Kembali
        </Link>
        <span className="text-sm font-mono text-gray-500">
          {files.length} Pages
        </span>
      </div>

      {/* --- READER AREA --- */}
      <div className="max-w-4xl mx-auto bg-black min-h-screen shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Loop Gambar */}
        {files.map((file: string, index: number) => {
          const imageUrl = `${baseUrl}/data/${hash}/${file}`;
          
          return (
            <div key={file} className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-auto block" // block biar gak ada celah putih antar gambar
                loading="lazy" // Biar hemat bandwidth (load pas discroll)
                referrerPolicy="no-referrer" // PENTING: Bypass hotlink protection
              />
              
              {/* Page Number (Opsional, muncul pas hover) */}
              <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-gray-400 opacity-0 hover:opacity-100 transition">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- FOOTER NAVIGATION --- */}
      <div className="max-w-4xl mx-auto p-10 text-center space-y-4">
        <p className="text-gray-500">Kamu sudah mencapai akhir chapter.</p>
        <button 
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold transition transform hover:scale-105"
        >
          Next Chapter →
        </button>
        {/* Note: Tombol Next Chapter butuh logika tambahan (ambil ID chapter sebelah), 
            nanti kita bahas kalau Reader ini udah jalan */}
      </div>

    </main>
  );
}