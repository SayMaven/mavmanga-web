// src/app/actions.ts
'use server';

import { getMangaTags, getChapterPages, getQuickSearch } from "@/services/mangadex";

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
    return await getChapterPages(chapterId);
  } catch (error) {
    return null;
  }
}
export async function fetchQuickSearchServer(query: string) {
  try {
    return await getQuickSearch(query);
  } catch (error) {
    return [];
  }
}