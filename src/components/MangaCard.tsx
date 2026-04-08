// src/components/MangaCard.tsx
'use client';

import Link from "next/link";

const getFlagUrl = (lang: string) => {
  const map: Record<string, string> = { 
  'en':'gb','ja':'jp','ko':'kr','zh':'cn','zh-hk':'hk','id':'id','fr':'fr','es':'es','es-la':'mx',
  'pt-br':'br','pt':'pt','ru':'ru','de':'de','it':'it','vi':'vn','th':'th',

  'tl':'ph','ms':'my','hi':'in','my':'mm','ne':'np','mn':'mn','ar':'sa','fa':'ir','he':'il','bn':'bd',
  'kk':'kz','ta':'in',

  'tr':'tr','pl':'pl','uk':'ua','cs':'cz','hu':'hu','ro':'ro','bg':'bg','nl':'nl','sv':'se','no':'no',
  'da':'dk','fi':'fi','el':'gr','sr':'rs','hr':'hr','lt':'lt','lv':'lv','et':'ee','sk':'sk','sl':'si',
  'ca':'es-ct','ka':'ge','az':'az','ur': 'pk',

  'ja-ro':'jp','ko-ro':'kr','zh-ro':'cn','la':'va','eo':'un'
  };
  const countryCode = map[lang] || 'xx'; 
  return `https://flagcdn.com/w40/${countryCode}.png`;
};

const getDisplayTitles = (manga: any) => {
    const attr = manga.attributes;
    const ogLang = attr.originalLanguage;
    const altTitles = attr.altTitles || [];
    const findTitle = (lang: string) => {
        return attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
    };
    const fallbackTitle = Object.values(attr.title)[0] as string || "No Title";
    let mainTitle = "";
    if (ogLang === 'ja') {
        mainTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallbackTitle;
    } else {
        mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
    }

    return mainTitle;
};

export default function MangaCard({ manga, large = false, className = "" }: { manga: any, large?: boolean, className?: string }) {
  const attr = manga.attributes;
  const originalLang = attr.originalLanguage;
  const title = getDisplayTitles(manga);
  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const myProxy = "https://manga-proxy.wahyunanda1258.workers.dev/?url=";
  const imageUrl = fileName 
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
    : `${myProxy}https://og.mangadex.org/og-image/manga/${manga.id}`;

  const rating = attr.contentRating;
  const status = attr.status;

  const getRatingBadge = (rate: string) => {
    switch(rate) {
        case 'safe': return 'bg-emerald-500';
        case 'suggestive': return 'bg-amber-500';
        case 'erotica': return 'bg-rose-500';
        case 'pornographic': return 'bg-purple-600';
        default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (stat: string) => {
      switch(stat) {
          case 'ongoing': return 'bg-blue-600';
          case 'completed': return 'bg-teal-500';
          case 'hiatus': return 'bg-orange-500';
          case 'cancelled': return 'bg-red-600';
          default: return 'bg-gray-600';
      }
  }

  return (
    <div className={`relative group w-full ${className}`}>
      <Link href={`/manga/${manga.id}`} className="block relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-orange-500/40 transition-all duration-300 bg-[#1e1e1e]">
        <img 
          src={imageUrl} 
          alt={title} 
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity" />
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 z-10">
            <span className={`${getRatingBadge(rating)} text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider backdrop-blur-md bg-opacity-90`}>
                {rating === 'pornographic' ? '18+' : rating}
            </span>
            
            {status && (
                <span className={`${getStatusBadge(status)} text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider backdrop-blur-md bg-opacity-90`}>
                    {status === 'ongoing' ? 'ONGOING' : status === 'completed' ? 'END' : status}
                </span>
            )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-3 z-10 bg-gradient-to-t from-black via-black/60 to-transparent pt-10 rounded-b-lg">
            <div className="flex flex-col gap-2">
                <h3 className="text-white font-bold text-sm leading-tight break-words group-hover:text-orange-400 transition-colors drop-shadow-md line-clamp-2">
                  {title}
                </h3>

                <div className="flex justify-end">
                    <img 
                        src={getFlagUrl(originalLang)} 
                        alt={originalLang} 
                        className="w-6 h-auto rounded-[3px] shadow-sm border border-white/10" 
                    />
                </div>
            </div>
        </div>
      </Link>
    </div>
  );
}