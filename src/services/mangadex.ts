// src/services/mangadex.ts

const API_BASE = 'https://api.mangadex.org';

// 1. FETCH DIRECT (Return Object: { data, total })
const fetchDirect = async (url: URL) => {
  try {
    const response = await fetch(url.toString(), { 
      cache: 'no-store', 
      headers: { 'User-Agent': 'MavManga-App/1.0.0' }
    });

    if (!response.ok) {
      console.warn(`API Error: ${response.status} on ${url.toString()}`);
      return { data: [], total: 0 };
    }

    const json = await response.json();
    return { 
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

// 2. GET CUSTOM LIST (Base Function)
export const getCustomMangaList = async (params: Record<string, string | string[] | number>) => {
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

  return await fetchDirect(targetUrl);
};

// Wrapper untuk Homepage (Agar return Array langsung)
const getListOnly = async (params: any) => {
    const res = await getCustomMangaList(params);
    return res.data; 
}

// 3. HOMEPAGE FUNCTIONS
export const getPopularNew = async () => getListOnly({
    'limit': 10,
    'order[followedCount]': 'desc',
    'createdAtSince': getDateAgo(35),
    'originalLanguage[]': ['ja', 'ko', 'zh'],
    'contentRating[]': ['safe', 'suggestive', 'erotica'] 
});

function getCurrentSeasonStartDate(): string {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Dec
  const year = now.getFullYear();

  let startMonth = 0;
  let startYear = year;

  if (month >= 2 && month <= 4) {
    // Spring (Maret - Mei) -> Mulai 1 Maret
    startMonth = 2; // Maret
  } else if (month >= 5 && month <= 7) {
    // Summer (Juni - Agustus) -> Mulai 1 Juni
    startMonth = 5; // Juni
  } else if (month >= 8 && month <= 10) {
    // Fall (Sept - Nov) -> Mulai 1 September
    startMonth = 8; // Sept
  } else {
    // Winter (Des - Feb) -> Mulai 1 Desember TAHUN LALU
    // Jika sekarang Jan/Feb 2026, startnya Des 2025.
    // Jika sekarang Des 2026, startnya Des 2026.
    startMonth = 11; // Desember
    if (month <= 1) { 
       startYear = year - 1; 
    }
  }

  // Format ke YYYY-MM-DDT00:00:00
  // Ingat bulan di JS mulai dari 0, jadi perlu +1 untuk format string jika manual,
  // tapi Date object menanganinya dengan baik.
  const dateObj = new Date(startYear, startMonth, 1);
  return dateObj.toISOString().split('T')[0] + 'T00:00:00';
}

// Fungsi Seasonal yang BENAR
export const getSeasonal = async () => {
    const seasonStart = getCurrentSeasonStartDate();

    return getListOnly({
        'limit': 15,
        // URUTKAN BERDASARKAN POPULARITAS (Followers)
        // Agar kita dapat "Best New Manga of Winter 2026"
        'order[rating]': 'desc', 

        // FILTER: Hanya manga yang DIBUAT (Debut) sejak awal musim ini
        'createdAtSince': seasonStart,

        // Filter standar
        'originalLanguage[]': ['ja'], // Fokus manga jepang (biasanya seasonal identik dengan ini)
        'contentRating[]': ['safe', 'suggestive', ],
        // Pastikan manga tersebut bukan sekedar entry kosong (sudah ada chapter)
        'hasAvailableChapters': 'true' 
    });
};

export const getRecentlyAdded = async () => getListOnly({
    'limit': 15,
    'order[createdAt]': 'desc',
    'originalLanguage[]': ['ja', 'ko', 'zh'],
    'contentRating[]': ['safe', 'suggestive', 'erotica']
});

//   'pornographic'

export const getRecommended = async () => getListOnly({
    'limit': 15,
    'order[followedCount]': 'desc',  
    'originalLanguage[]': ['ja'],
    'contentRating[]': ['safe', 'suggestive']
});

// 4. SEARCH FUNCTION (FULL FEATURED + 14 SORT OPTIONS)
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
  excludedTagsMode?: string
}) => {
  
  // Pagination Logic
  const limit = 30;
  const page = params.page && params.page > 1 ? params.page : 1;
  const offset = (page - 1) * limit;

  const queryParams: any = {
    'limit': limit,
    'offset': offset,
    'title': params.q || "",
    'includes[]': ['cover_art', 'author', 'artist'],
  };

  // --- 14 SORTING OPTIONS ---
  const sort = params.sortBy || 'none';

  switch (sort) {
    case 'relevance':
      queryParams['order[relevance]'] = 'desc'; 
      break;
    case 'latest_upload':
      queryParams['order[latestUploadedChapter]'] = 'desc';
      break;
    case 'oldest_upload':
      queryParams['order[latestUploadedChapter]'] = 'asc';
      break;
    case 'title_asc':
      queryParams['order[title]'] = 'asc';
      break;
    case 'title_desc':
      queryParams['order[title]'] = 'desc';
      break;
    case 'rating_high':
      queryParams['order[rating]'] = 'desc';
      break;
    case 'rating_low':
      queryParams['order[rating]'] = 'asc';
      break;
    case 'follows_high':
      queryParams['order[followedCount]'] = 'desc';
      break;
    case 'follows_low':
      queryParams['order[followedCount]'] = 'asc';
      break;
    case 'created_new':
      queryParams['order[createdAt]'] = 'desc'; 
      break;
    case 'created_old':
      queryParams['order[createdAt]'] = 'asc'; 
      break;
    case 'year_asc':
      queryParams['order[year]'] = 'asc';
      break;
    case 'year_desc':
      queryParams['order[year]'] = 'desc';
      break;
    case 'none':
    default:
      queryParams['order[latestUploadedChapter]'] = 'desc';
      break;
  }
  // ---------------------------

  // Filters
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

  if (params.year) queryParams['year'] = params.year;
  if (params.hasChapters === 'true') queryParams['hasAvailableChapters'] = 'true';

  // Authors & Artists
  if (params.authors && params.authors !== '') {
    queryParams['authors[]'] = params.authors.split(',');
  }
  if (params.artists && params.artists !== '') {
    queryParams['artists[]'] = params.artists.split(',');
  }

  return getCustomMangaList(queryParams);
};

// 5. LATEST UPDATES (FIXED)
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
    const response = await fetchDirect(targetUrl);
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

    const mangaIdsToFetch = finalChapters.map(c => c.relationships.find((r: any) => r.type === 'manga').id);
    
    if (mangaIdsToFetch.length > 0) {
        const coversUrl = new URL(`${API_BASE}/manga`);
        mangaIdsToFetch.forEach(id => coversUrl.searchParams.append('ids[]', id));
        coversUrl.searchParams.append('includes[]', 'cover_art');
        coversUrl.searchParams.append('limit', '100');
        ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => coversUrl.searchParams.append('contentRating[]', r));
        
        const coversRes = await fetchDirect(coversUrl);
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

// 6. SEARCH PEOPLE (Untuk Filter Author/Artist)
export const searchPeople = async (name: string) => {
  const targetUrl = new URL(`${API_BASE}/author`);
  targetUrl.searchParams.append('name', name);
  targetUrl.searchParams.append('limit', '10'); 
  const res = await fetchDirect(targetUrl);
  return res.data; 
};

// 7. GET AUTHORS BY IDS (Untuk Sync Nama Author/Artist di Frontend)
export const getAuthorsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const targetUrl = new URL(`${API_BASE}/author`);
  ids.forEach(id => targetUrl.searchParams.append('ids[]', id));
  targetUrl.searchParams.append('limit', '100'); 
  const res = await fetchDirect(targetUrl);
  return res.data; 
};

// 8. DETAIL & READER
export const getMangaDetail = async (id: string) => {
  const targetUrl = new URL(`${API_BASE}/manga/${id}`);
  ['cover_art', 'author', 'artist'].forEach(i => targetUrl.searchParams.append('includes[]', i));
  try {
    const res = await fetch(targetUrl.toString());
    const json = await res.json();
    return json.data;
  } catch (e) { return null; }
};


export const getMangaFeed = async (
    id: string, 
    offset: number = 0, 
    order: 'asc' | 'desc' = 'desc', 
    limit: number = 100 // Parameter sudah benar
) => {
  const targetUrl = new URL(`${API_BASE}/manga/${id}/feed`);
  
  // --- PERBAIKAN DISINI ---
  // Jangan hardcode '100', tapi gunakan variabel 'limit'
  targetUrl.searchParams.append('limit', limit.toString()); 
  
  targetUrl.searchParams.append('offset', offset.toString());
  
  // GUNAKAN PARAMETER ORDER DISINI
  targetUrl.searchParams.append('order[volume]', order); 
  targetUrl.searchParams.append('order[chapter]', order);
  
  // Filter Rating & Includes (Wajib ada)
  ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => targetUrl.searchParams.append('contentRating[]', r));
  ['scanlation_group', 'user'].forEach(i => targetUrl.searchParams.append('includes[]', i));
  
  const res = await fetchDirect(targetUrl);
  return {
      data: res.data || [],
      total: res.total || 0
  };
};

export const getChapterPages = async (chapterId: string) => {
  try {
    const targetUrl = new URL(`${API_BASE}/at-home/server/${chapterId}`);
    targetUrl.searchParams.append('forcePort443', 'false'); 
    const response = await fetch(targetUrl.toString());
    if (!response.ok) throw new Error(`Error Reader: ${response.status}`);
    return await response.json();
  } catch (error) { return null; }
};

export const getMangaTags = async () => {
  const targetUrl = new URL(`${API_BASE}/manga/tag`);
  const res = await fetchDirect(targetUrl);
  return res.data; // Mengembalikan list tags (id, attributes: { name, group })
};

export const getMangaCovers = async (mangaId: string) => {
  try {
    const res = await fetch(`https://api.mangadex.org/cover?manga[]=${mangaId}&limit=100&order[volume]=asc`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch covers:", error);
    return [];
  }
};


// src/services/mangadex.ts

export const getMangaRecommendations = async (
    title: string, 
    tagIds: string[], 
    demographic?: string | null, 
    currentId?: string
) => {
  try {
    const results = new Map(); // Pakai Map untuk otomatis handle duplikat ID

    // --- CONFIG FILTER UMUM (Dipakai di kedua fetch) ---
    // Helper untuk append params standar
    const appendBaseParams = (url: URL) => {
        url.searchParams.append('limit', '25');
        url.searchParams.append('includes[]', 'cover_art');
        url.searchParams.append('includes[]', 'author');
        url.searchParams.append('hasAvailableChapters', 'true'); // Pastikan ada isinya
        
        // STRICT DEMOGRAPHIC: Agar Josei tidak nyampur Shounen
        if (demographic) {
            url.searchParams.append('publicationDemographic[]', demographic);
        }

        // NO CONTENT RATING LIMIT
        ['safe', 'suggestive', 'erotica', 'pornographic'].forEach(r => 
            url.searchParams.append('contentRating[]', r)
        );
    };

    // --- FETCH 1: BERDASARKAN JUDUL (Prioritas Utama) ---
    // Mencari manga dengan nama mirip (misal: "Beyblade")
    if (title) {
        const urlTitle = new URL(`${API_BASE}/manga`);
        // Bersihkan judul dari simbol aneh agar pencarian lebih akurat
        const cleanTitle = title.replace(/[^\w\s]/gi, '').trim(); 
        urlTitle.searchParams.append('title', cleanTitle);
        
        // SORTING: RELEVANCE (Bukan Popularity!)
        urlTitle.searchParams.append('order[relevance]', 'desc');
        
        appendBaseParams(urlTitle);

        try {
            const resTitle = await fetchDirect(urlTitle);
            if (resTitle.data && Array.isArray(resTitle.data)) {
                resTitle.data.forEach((m: any) => {
                    if (m.id !== currentId) results.set(m.id, m);
                });
            }
        } catch (e) { /* Ignore fail */ }
    }

    // --- FETCH 2: BERDASARKAN TAGS/GENRE (Pelengkap) ---
    // Jika hasil judul < 12, cari berdasarkan Genre yang cocok
    if (results.size < 12 && tagIds && tagIds.length > 0) {
        const urlTags = new URL(`${API_BASE}/manga`);
        
        // Ambil 5 Tag agar spesifik (misal: Romance + School + SliceOfLife + Drama)
        // Semakin banyak tag, semakin "mirip" isinya, bukan sekedar populer
        tagIds.slice(0, 5).forEach(tag => {
            urlTags.searchParams.append('includedTags[]', tag);
        });

        // SORTING: RELEVANCE (Cari yang tag-nya paling banyak cocok)
        urlTags.searchParams.append('order[relevance]', 'desc');
        // OPSI ALTERNATIF: Jika relevance isinya sampah, bisa ganti 'order[rating]=desc' (Kualitas bagus, bukan populer)
        
        appendBaseParams(urlTags);

        try {
            const resTags = await fetchDirect(urlTags);
            if (resTags.data && Array.isArray(resTags.data)) {
                resTags.data.forEach((m: any) => {
                    if (m.id !== currentId) results.set(m.id, m);
                });
            }
        } catch (e) { /* Ignore fail */ }
    }

    // Kembalikan sebagai Array
    return Array.from(results.values());

  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
};