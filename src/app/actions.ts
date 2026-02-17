// src/app/actions.ts
'use server';

import { getMangaTags } from "@/services/mangadex";

// Fungsi ini akan berjalan di Server Vercel, lalu hasilnya dikirim ke HP
export async function fetchTagsServer() {
  // Panggil service yang sudah ada
  const tags = await getMangaTags();
  return tags;
}