// src/utils/chapterUtils.ts

export const formatTimeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  return `${Math.floor(diffInMonths / 12)}y`;
};

export const getFlagUrl = (langCode: string) => {
  // MangaDex supported language → ISO 3166-1 alpha-2 country code (flagcdn.com)
  const map: Record<string, string> = {
    // East Asia
    'ja':'jp', 'ko':'kr', 'zh':'cn', 'zh-hk':'hk',
    // Southeast Asia
    'id':'id', 'vi':'vn', 'th':'th', 'tl':'ph', 'ms':'my',
    'my':'mm', 'km':'kh', 'lo':'la',
    // South Asia
    'hi':'in', 'bn':'bd', 'ta':'lk', 'ne':'np', 'ur':'pk', 'si':'lk',
    // Middle East & Central Asia
    'ar':'sa', 'fa':'ir', 'he':'il', 'tr':'tr',
    'az':'az', 'kk':'kz', 'uz':'uz', 'ky':'kg', 'ka':'ge',
    // North/Central Asia
    'mn':'mn',
    // Western Europe
    'en':'gb', 'fr':'fr', 'de':'de', 'es':'es', 'es-la':'mx',
    'pt':'pt', 'pt-br':'br', 'it':'it', 'nl':'nl', 'ca':'es-ct',
    // Northern Europe
    'sv':'se', 'no':'no', 'nn':'no', 'da':'dk', 'fi':'fi',
    // Eastern Europe
    'ru':'ru', 'pl':'pl', 'uk':'ua', 'cs':'cz', 'sk':'sk',
    'hu':'hu', 'ro':'ro', 'bg':'bg',
    // South/SW Europe
    'el':'gr', 'sr':'rs', 'hr':'hr', 'sl':'si', 'mk':'mk',
    'sq':'al', 'lt':'lt', 'lv':'lv', 'et':'ee',
    // Africa
    'af':'za', 'sw':'tz', 'am':'et',
    // Special / Constructed
    'la':'va', 'eo':'un',
    // Romanized Variants
    'ja-ro':'jp', 'ko-ro':'kr', 'zh-ro':'cn',
  };
  const code = map[langCode];
  return code ? `https://flagcdn.com/w20/${code}.png` : null;
};

export const getLangBorderColor = (langCode: string) => {
  switch (langCode) {
    case 'en': return 'bg-blue-400';
    case 'id': return 'bg-red-500'; 
    case 'ja': return 'bg-white';
    case 'ko': return 'bg-blue-300';
    default: return 'bg-gray-500';
  }
};