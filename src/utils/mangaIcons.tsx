// src/utils/mangaIcons.tsx

export const getLinkInfo = (key: string, url: string) => {
  const k = key.toLowerCase();
  
  // A. DATABASE STATIS (Untuk Key MangaDex yang sudah pasti domainnya)
  const staticMap: Record<string, { label: string, domain: string }> = {
    mal: { label: 'MyAnimeList', domain: 'myanimelist.net' },
    al: { label: 'AniList', domain: 'anilist.co' },
    kt: { label: 'Kitsu', domain: 'kitsu.io' },
    mu: { label: 'MangaUpdates', domain: 'mangaupdates.com' },
    ap: { label: 'Anime-Planet', domain: 'anime-planet.com' },
    bw: { label: 'Book☆Walker', domain: 'bookwalker.jp' },
    amz: { label: 'Amazon', domain: 'amazon.co.jp' },
    ebj: { label: 'eBookJapan', domain: 'ebookjapan.yahoo.co.jp' },
    cdj: { label: 'CDJapan', domain: 'cdjapan.co.jp' },
  };

  // Jika Key ada di database statis, langsung return ikon dari domain tersebut
  if (staticMap[k]) {
    return { 
      label: staticMap[k].label, 
      iconSrc: `https://www.google.com/s2/favicons?domain=${staticMap[k].domain}&sz=128` 
    };
  }

  // B. EKSTRAKSI DINAMIS (Untuk 'raw', 'eng', atau link custom)
  let domain = '';
  let label = k.toUpperCase();

  // Label default untuk key umum
  if (k === 'raw') label = 'Official Raw';
  if (k === 'eng' || k === 'engtl') label = 'Official Eng';

  // Coba ambil domain dari URL asli
  if (url) {
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
      
      // Perbaiki Label berdasarkan nama domain agar lebih cantik
      if (domain.includes('pixiv')) label = 'Pixiv';
      else if (domain.includes('twitter') || domain.includes('x.com')) label = 'X (Twitter)';
      else if (domain.includes('patreon')) label = 'Patreon';
      else if (domain.includes('fanbox')) label = 'Fanbox';
      else if (domain.includes('booth')) label = 'Booth';
      else if (domain.includes('nicovideo') || domain.includes('nico.ms')) label = 'NicoNico';
      else if (domain.includes('comico')) label = 'Comico';
      else if (domain.includes('webtoons')) label = 'Webtoon';
      else if (domain.includes('tapas')) label = 'Tapas';
      else if (domain.includes('bilibili')) label = 'Bilibili';
      
    } catch (e) {
       // URL tidak valid, biarkan domain kosong
    }
  }

  // C. HASIL AKHIR
  return { 
    label, 
    // Jika domain ketemu, minta favicon ke Google. Jika tidak, return null (nanti pakai fallback)
    iconSrc: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null 
  };
};