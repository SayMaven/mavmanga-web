// src/components/SearchCard.tsx
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
    } 
    else {
        mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
    }

    return mainTitle;
};

export default function SearchCard({ manga }: { manga: any }) {
  const attr = manga.attributes;
  const title = getDisplayTitles(manga);
  const description = attr.description?.en || attr.description?.id || "No description available.";
  const status = attr.status;
  const originalLang = attr.originalLanguage; 
  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const myProxy = "https://manga-proxy.wahyunanda1258.workers.dev/?url=";
  const imageUrl = fileName 
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
    : `${myProxy}https://og.mangadex.org/og-image/manga/${manga.id}`;

  const rating = attr.contentRating;

  return (
    <div className="bg-[#191A1C] rounded-lg overflow-hidden flex gap-4 p-3 hover:bg-[#232529] border border-white/5 transition-all group shadow-lg">
      <Link href={`/manga/${manga.id}`} className="w-24 md:w-32 flex-shrink-0 relative aspect-[2/3] overflow-hidden rounded shadow-2xl">
        <img 
          src={imageUrl} 
          alt={title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
        />

        <div className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent w-full flex justify-end">
             <img 
               src={getFlagUrl(originalLang)} 
               alt={originalLang} 
               className="w-5 h-auto shadow-sm rounded-[2px]" 
             />
        </div>
      </Link>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-2">
          <Link href={`/manga/${manga.id}`}>
            <h3 className="text-white font-bold text-lg md:text-xl line-clamp-1 group-hover:text-orange-500 transition" title={title}>
              {title}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status === 'ongoing' ? 'bg-blue-600/20 text-blue-400' : 'bg-green-600/20 text-green-400'}`}>
              {status}
            </span>
            <span className="bg-orange-600/20 text-orange-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              {rating}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {attr.tags.slice(0, 5).map((tag: any) => (
            <span key={tag.id} className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 uppercase tracking-tighter">
              {tag.attributes.name.en}
            </span>
          ))}
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 md:line-clamp-3 leading-relaxed">
          {description.replace(/[*_~`]/g, '')}
        </p>
      </div>
    </div>
  );
}