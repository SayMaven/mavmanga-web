// src/app/actions.ts
'use server';

import { getMangaTags, getChapterPages } from "@/services/mangadex";

// Fungsi untuk Filter Tags
export async function fetchTagsServer() {
  try {
    const tags = await getMangaTags();
    return tags;
  } catch (error) {
    console.error("Server Action Error (Tags):", error);
    return [];
  }
}

export async function fetchChapterPagesServer(chapterId: string) {
  try {
    const data = await getChapterPages(chapterId);
    return data;
  } catch (error) {
    console.error("Server Action Error (Pages):", error);
    return null;
  }
}