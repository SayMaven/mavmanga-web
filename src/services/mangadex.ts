// src/services/mangadex.ts

const API_BASE = 'https://api.mangadex.org';

// --- 1. HELPER FETCH (Untuk List Data) ---
// Fungsi ini khusus untuk mengambil data berbentuk ARRAY (List Manga, Chapter, dll)
// Menambahkan dukungan parameter 'options' untuk caching
const fetchDirect = async (url: URL, options?: RequestInit) => {
  try {
    const response = await fetch(url.toString(), { 
      headers: { 'User-Agent': 'MavManga-App/1.0.0' },
      cache: 'force-cache', // Default cache
      ...options, // Merge opsi cache tambahan (revalidate/no-store)
    });

    if (!response.ok) {
      console.warn(`API Error: ${response.status} on ${url.toString()}`);
      return { data: [], total: 0 };
    }

    const json = await response.json();
    return { 
        // PENTING: Hanya ambil jika array, hindari error jika format beda
        data: Array.isArray(json.data) ? json.data : [],
        total: json.total || 0 
    };
  } catch (error) {
    console.error("Network Error:", error);
    return { data: [], total: 0 };
  }
};

const getDateAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 19);
};

// --- 2. GET CUSTOM LIST (Base Function) ---
export const getCustomMangaList = async (
    params: Record<string, string | string[] | number>,
    options?: RequestInit
) => {
  const targetUrl = new URL(`${API_BASE}/manga`);

  targetUrl.searchParams.append('includes[]', 'cover_art');
  targetUrl.searchParams.append('includes[]', 'author');
  targetUrl.searchParams.append('includes[]', 'artist');
  targetUrl.searchParams.append('hasAvailableChapters', 'true');

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach(v => targetUrl.searchParams.append(key, v));
    } else {
      targetUrl.searchParams.append(key, String(value));
    }
  });

  return await fetchDirect(targetUrl, options);
};

// Wrapper Helper
const getListOnly = async (params: any, options?: RequestInit) => {
    const res = await getCustomMangaList(params, options);
    return res.data; 
}

// --- 3. HOMEPAGE FUNCTIONS (Cached 1 Hour) ---

export const getPopularNew = async () => getListOnly({
    'limit': 10,
    'order[followedCount]': 'desc',
    'createdAtSince': getDateAgo(35),
    'originalLanguage[]': ['ja', 'ko', 'zh'],
    'contentRating[]': ['safe', 'suggestive', 'erotica'] 
}, { next: { revalidate: 3600 } });

function getCurrentSeasonStartDate(): string {
  const now = new Date();
  const month = now.getMonth(); 
  const year = now.getFullYear();

  let startMonth = 0;
  let startYear = year;

  if (month >= 2 && month <= 4) startMonth = 2;
  else if (month >= 5 && month <= 7) startMonth = 5;
  else if (month >= 8 && month <= 10) startMonth = 8;
  else {
    startMonth = 11;
    if (month <= 1) startYear = year - 1; 
  }

  const dateObj = new Date(startYear, startMonth, 1);
  return dateObj.toISOString().split('T')[0] + 'T00:00:00';
}

export const getSeasonal = async () => {
    const seasonStart = getCurrentSeasonStartDate();
    return getListOnly({
        'limit': 15,
        'order[rating]': 'desc', 
        'createdAtSince': seasonStart,
        'originalLanguage[]': ['ja'], 
        'contentRating[]': ['safe', 'suggestive', ],
        'hasAvailableChapters': 'true' 
    }, { next: { revalidate: 3600 } });
};

export const getRecentlyAdded = async () => getListOnly({
    'limit': 15,
    'order[createdAt]': 'desc',
    'originalLanguage[]': ['ja', 'ko', 'zh'],
    'contentRating[]': ['safe', 'suggestive', 'erotica']
}, { next: { revalidate: 3600 } });

export const getRecommended = async () => getListOnly({
    'limit': 15,
    'order[relevance]': 'desc',
    'order[followedCount]': 'desc',
    'originalLanguage[]': ['ja'],
    'contentRating[]': ['safe', 'suggestive', 'pornographic']
}, { next: { revalidate: 3600 } });


// --- 4. SEARCH FUNCTION (No Cache) ---
export const searchManga = async (params: { 
  q?: string, 
  status?: string, 
  demographic?: string,
  rating?: string,
  sortBy?: string,
  year?: string,
  language?: string,
  hasChapters?: string,
  page?: number,
  authors?: string,
  artists?: string,
  includedTags?: string,
  excludedTags?: string,
  includedTagsMode?: string,
  excludedTagsMode?: string,
  availableTranslatedLanguage?: string
}) => {
  
  const limit = 30;
  const page = params.page && params.page > 1 ? params.page : 1;
  const offset = (page - 1) * limit;

  const queryParams: any = {
    'limit': limit,
    'offset': offset,
    'title': params.q || "",
    'includes[]': ['cover_art', 'author', 'artist'],
  };

  const sort = params.sortBy || 'none';

  switch (sort) {
    case 'relevance': queryParams['order[relevance]'] = 'desc'; break;
    case 'latest_upload': queryParams['order[latestUploadedChapter]'] = 'desc'; break;
    case 'oldest_upload': queryParams['order[latestUploadedChapter]'] = 'asc'; break;
    case 'title_asc': queryParams['order[title]'] = 'asc'; break;
    case 'title_desc': queryParams['order[title]'] = 'desc'; break;
    case 'rating_high': queryParams['order[rating]'] = 'desc'; break;
    case 'rating_low': queryParams['order[rating]'] = 'asc'; break;
    case 'follows_high': queryParams['order[followedCount]'] = 'desc'; break;
    case 'follows_low': queryParams['order[followedCount]'] = 'asc'; break;
    case 'created_new': queryParams['order[createdAt]'] = 'desc'; break;
    case 'created_old': queryParams['order[createdAt]'] = 'asc'; break;
    case 'year_asc': queryParams['order[year]'] = 'asc'; break;
    case 'year_desc': queryParams['order[year]'] = 'desc'; break;
    case 'none':
    default: queryParams['order[latestUploadedChapter]'] = 'desc'; break;
  }

  if (params.includedTags) queryParams['includedTags[]'] = params.includedTags.split(',');
  if (params.excludedTags) queryParams['excludedTags[]'] = params.excludedTags.split(',');
  if (params.includedTagsMode) queryParams['includedTagsMode'] = params.includedTagsMode;
  if (params.excludedTagsMode) queryParams['excludedTagsMode'] = params.excludedTagsMode;
  
  if (params.status && params.status !== 'any') queryParams['status[]'] = params.status.split(',');
  if (params.demographic && params.demographic !== 'any') queryParams['publicationDemographic[]'] = params.demographic;
  
  if (params.rating && params.rating !== 'any' && params.rating !== '') {
    queryParams['contentRating[]'] = params.rating.split(',');
  } else {
    queryParams['contentRating[]'] = ['safe', 'suggestive', 'erotica', 'pornographic'];
  }

  if (params.language && params.language !== 'any' && params.language !== '') {
    queryParams['originalLanguage[]'] = params.language.split(',');
  }

  if (params.availableTranslatedLanguage && params.availableTranslatedLanguage !== '') {
    queryParams['availableTranslatedLanguage[]'] = params.availableTranslatedLanguage.split(',');
  }

  if (params.year) queryParams['year'] = params.year;
  if (params.hasChapters === 'true') queryParams['hasAvailableChapters'] = 'true';

  if (params.authors && params.authors !== '') {
    queryParams['authors[]'] = params.authors.split(',');
  }
  if (params.artists && params.artists !== '') {
    queryParams['artists[]'] = params.artists.split(',');
  }

  // Gunakan cache: 'no-store' agar hasil search selalu fresh saat filter diubah
  return getCustomMangaList(queryParams, { cache: 'no-store' });
};

// --- 5. LATEST UPDATES (Cache 60 Detik) ---
export const getLatestChapters = async (limit = 24, page = 1) => { 
  const offset = (page - 1) * limit;
  
  const targetUrl = new URL(`${API_BASE}/chapter`);
  targetUrl.searchParams.append('limit', '100'); 
  targetUrl.searchParams.append('offset', offset.toString()); 
  targetUrl.searchParams.append('order[readableAt]', 'desc'); 
  targetUrl.searchParams.append('includes[]', 'manga'); 
  targetUrl.searchParams.append('includes[]', 'scanlation_group'); 
  targetUrl.searchParams.append('includes[]', 'user'); 

  ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => targetUrl.searchParams.append('contentRating[]', r));

  try {
    const response = await fetchDirect(targetUrl, { next: { revalidate: 60 } });
    const data = response.data;

    if (!Array.isArray(data)) return [];

    const uniqueMangaIds = new Set();
    const uniqueChapters = [];

    for (const chapter of data) {
      const mangaRel = chapter.relationships.find((r: any) => r.type === 'manga');
      if (!mangaRel) continue;

      if (!uniqueMangaIds.has(mangaRel.id)) {
        uniqueMangaIds.add(mangaRel.id);
        uniqueChapters.push(chapter);
      }
    }

    const finalChapters = uniqueChapters.slice(0, limit);

    // Fetch Covers untuk chapter
    const mangaIdsToFetch = finalChapters.map(c => c.relationships.find((r: any) => r.type === 'manga').id);
    
    if (mangaIdsToFetch.length > 0) {
        const coversUrl = new URL(`${API_BASE}/manga`);
        mangaIdsToFetch.forEach(id => coversUrl.searchParams.append('ids[]', id));
        coversUrl.searchParams.append('includes[]', 'cover_art');
        coversUrl.searchParams.append('limit', '100');
        ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => coversUrl.searchParams.append('contentRating[]', r));
        
        // Cache covers juga agar sinkron
        const coversRes = await fetchDirect(coversUrl, { next: { revalidate: 60 } });
        const coversData = coversRes.data;
        
        const coverMap: Record<string, string> = {};
        if (Array.isArray(coversData)) {
            coversData.forEach((manga: any) => {
                const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
                if (coverRel?.attributes?.fileName) {
                    coverMap[manga.id] = coverRel.attributes.fileName;
                }
            });
        }
        return finalChapters.map(chapter => {
            const mangaRel = chapter.relationships.find((r: any) => r.type === 'manga');
            return { ...chapter, coverFileName: coverMap[mangaRel.id] || null };
        });
    }

    return finalChapters;
  } catch (e) {
    return [];
  }
};

// --- 6. SEARCH PEOPLE (No Cache) ---
export const searchPeople = async (name: string) => {
  const targetUrl = new URL(`${API_BASE}/author`);
  targetUrl.searchParams.append('name', name);
  targetUrl.searchParams.append('limit', '10'); 
  const res = await fetchDirect(targetUrl, { cache: 'no-store' });
  return res.data; 
};

// --- 7. GET AUTHORS BY IDS (Cache 1 Hour) ---
export const getAuthorsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const targetUrl = new URL(`${API_BASE}/author`);
  ids.forEach(id => targetUrl.searchParams.append('ids[]', id));
  targetUrl.searchParams.append('limit', '100'); 
  const res = await fetchDirect(targetUrl, { next: { revalidate: 3600 } });
  return res.data; 
};

// --- 8. DETAIL & READER (PERBAIKAN UTAMA: Cache 1 Jam) ---
// Sebelumnya pakai fetchDirect (khusus list), jadi error saat ambil single object.
// Sekarang pakai fetch biasa, tapi kita pasang revalidate agar tetep nge-cache.
export const getMangaDetail = async (id: string) => {
  const targetUrl = new URL(`${API_BASE}/manga/${id}`);
  ['cover_art', 'author', 'artist'].forEach(i => targetUrl.searchParams.append('includes[]', i));
  
  try {
    const res = await fetch(targetUrl.toString(), {
        headers: { 'User-Agent': 'MavManga-App/1.0.0' },
        next: { revalidate: 3600 } // <--- CACHE AKTIF DISINI
    });
    const json = await res.json();
    return json.data; // Return single object
  } catch (e) { return null; }
};

// Manga Feed (Cache 2 Menit)
export const getMangaFeed = async (
    id: string, 
    offset: number = 0, 
    order: 'asc' | 'desc' = 'desc', 
    limit: number = 100
) => {
  const targetUrl = new URL(`${API_BASE}/manga/${id}/feed`);
  
  targetUrl.searchParams.append('limit', limit.toString()); 
  targetUrl.searchParams.append('offset', offset.toString());
  targetUrl.searchParams.append('order[volume]', order); 
  targetUrl.searchParams.append('order[chapter]', order);
  
  ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => targetUrl.searchParams.append('contentRating[]', r));
  ['scanlation_group', 'user'].forEach(i => targetUrl.searchParams.append('includes[]', i));
  
  const res = await fetchDirect(targetUrl, { next: { revalidate: 120 } });
  return {
      data: res.data || [],
      total: res.total || 0
  };
};

// Get Pages (No Cache - WAJIB)
export const getChapterPages = async (chapterId: string) => {
  try {
    const targetUrl = new URL(`${API_BASE}/at-home/server/${chapterId}`);
    targetUrl.searchParams.append('forcePort443', 'false'); 
    
    // Token MD@Home expired dalam 15 menit, jadi jangan di-cache
    const response = await fetch(targetUrl.toString(), { cache: 'no-store' });
    
    if (!response.ok) throw new Error(`Error Reader: ${response.status}`);
    return await response.json();
  } catch (error) { return null; }
};

// Manga Tags (Cache 24 Jam)
export const getMangaTags = async () => {
  const targetUrl = new URL(`${API_BASE}/manga/tag`);
  const res = await fetchDirect(targetUrl, { next: { revalidate: 86400 } });
  return res.data; 
};

// Covers (Cache 1 Jam)
export const getMangaCovers = async (mangaId: string) => {
  try {
    const res = await fetch(`https://api.mangadex.org/cover?manga[]=${mangaId}&limit=100&order[volume]=asc`, { 
        next: { revalidate: 3600 } 
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch covers:", error);
    return [];
  }
};

// --- 9. RECOMMENDATIONS (Cache 1 Hour) ---
export const getMangaRecommendations = async (
    title: string, 
    tagIds: string[], 
    demographic?: string | null, 
    currentId?: string
) => {
  try {
    const results = new Map();

    const appendBaseParams = (url: URL) => {
        url.searchParams.append('limit', '25');
        url.searchParams.append('includes[]', 'cover_art');
        url.searchParams.append('includes[]', 'author');
        url.searchParams.append('hasAvailableChapters', 'true');
        
        if (demographic) {
            url.searchParams.append('publicationDemographic[]', demographic);
        }

        ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => 
            url.searchParams.append('contentRating[]', r)
        );
    };

    const cacheOptions = { next: { revalidate: 3600 } };

    if (title) {
        const urlTitle = new URL(`${API_BASE}/manga`);
        const cleanTitle = title.replace(/[^\w\s]/gi, '').trim(); 
        urlTitle.searchParams.append('title', cleanTitle);
        urlTitle.searchParams.append('order[relevance]', 'desc');
        appendBaseParams(urlTitle);

        try {
            const resTitle = await fetchDirect(urlTitle, cacheOptions);
            if (resTitle.data && Array.isArray(resTitle.data)) {
                resTitle.data.forEach((m: any) => {
                    if (m.id !== currentId) results.set(m.id, m);
                });
            }
        } catch (e) { }
    }

    if (results.size < 12 && tagIds && tagIds.length > 0) {
        const urlTags = new URL(`${API_BASE}/manga`);
        tagIds.slice(0, 5).forEach(tag => {
            urlTags.searchParams.append('includedTags[]', tag);
        });
        urlTags.searchParams.append('order[relevance]', 'desc');
        appendBaseParams(urlTags);

        try {
            const resTags = await fetchDirect(urlTags, cacheOptions);
            if (resTags.data && Array.isArray(resTags.data)) {
                resTags.data.forEach((m: any) => {
                    if (m.id !== currentId) results.set(m.id, m);
                });
            }
        } catch (e) { }
    }

    return Array.from(results.values());

  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
};