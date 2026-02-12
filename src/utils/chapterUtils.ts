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
  const map: Record<string, string> = { 
  'en':'gb','ja':'jp','ko':'kr','zh':'cn','zh-hk':'hk','id':'id','fr':'fr','es':'es','es-la':'mx',
  'pt-br':'br','pt':'pt','ru':'ru','de':'de','it':'it','vi':'vn','th':'th',

  'tl':'ph','ms':'my','hi':'in','my':'mm','ne':'np','mn':'mn','ar':'sa','fa':'ir','he':'il','bn':'bd',
  'kk':'kz','ta':'in',

  'tr':'tr','pl':'pl','uk':'ua','cs':'cz','hu':'hu','ro':'ro','bg':'bg','nl':'nl','sv':'se','no':'no',
  'da':'dk','fi':'fi','el':'gr','sr':'rs','hr':'hr','lt':'lt','lv':'lv','et':'ee','sk':'sk','sl':'si',
  'ca':'es-ct','ka':'ge','az':'az', 'ur': 'pk',

  'ja-ro':'jp','ko-ro':'kr','zh-ro':'cn','la':'va','eo':'un'
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