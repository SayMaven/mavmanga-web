// src/utils/mangaIcons.tsx

export const getLinkInfo = (key: string, url: string) => {
  const k = key.toLowerCase();
  
  // A. DATABASE STATIS 
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

  if (staticMap[k]) {
    return { 
      label: staticMap[k].label, 
      iconSrc: `https://www.google.com/s2/favicons?domain=${staticMap[k].domain}&sz=128` 
    };
  }

  // B. EKSTRAKSI DINAMIS 
  let domain = '';
  let label = k.toUpperCase();
  if (k === 'raw') label = 'Official Raw';
  if (k === 'eng' || k === 'engtl') label = 'Official Eng';
  if (url) {
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
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
    }
  }

  return { 
    label, 
    iconSrc: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null 
  };
};