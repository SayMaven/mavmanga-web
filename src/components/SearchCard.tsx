// src/components/SearchCard.tsx
'use client';

import Link from "next/link";
import { memo } from "react";

// MangaDex supported language → ISO 3166-1 alpha-2 country code (flagcdn.com)
const FLAG_MAP: Record<string, string> = {
  'ja':'jp', 'ko':'kr', 'zh':'cn', 'zh-hk':'hk',
  'id':'id', 'vi':'vn', 'th':'th', 'tl':'ph', 'ms':'my',
  'my':'mm', 'km':'kh', 'lo':'la',
  'hi':'in', 'bn':'bd', 'ta':'lk', 'ne':'np', 'ur':'pk', 'si':'lk',
  'ar':'sa', 'fa':'ir', 'he':'il', 'tr':'tr',
  'az':'az', 'kk':'kz', 'uz':'uz', 'ky':'kg', 'ka':'ge',
  'mn':'mn',
  'en':'gb', 'fr':'fr', 'de':'de', 'es':'es', 'es-la':'mx',
  'pt':'pt', 'pt-br':'br', 'it':'it', 'nl':'nl', 'ca':'es-ct',
  'sv':'se', 'no':'no', 'nn':'no', 'da':'dk', 'fi':'fi',
  'ru':'ru', 'pl':'pl', 'uk':'ua', 'cs':'cz', 'sk':'sk',
  'hu':'hu', 'ro':'ro', 'bg':'bg',
  'el':'gr', 'sr':'rs', 'hr':'hr', 'sl':'si', 'mk':'mk',
  'sq':'al', 'lt':'lt', 'lv':'lv', 'et':'ee',
  'af':'za', 'sw':'tz', 'am':'et',
  'la':'va', 'eo':'un',
  'ja-ro':'jp', 'ko-ro':'kr', 'zh-ro':'cn',
};

const getFlagUrl = (lang: string) => {
  const code = FLAG_MAP[lang] || 'xx';
  return `https://flagcdn.com/w40/${code}.png`;
};

const getDisplayTitle = (manga: any): string => {
  const attr = manga.attributes;
  const ogLang = attr.originalLanguage;
  const altTitles = attr.altTitles || [];
  const findTitle = (lang: string) =>
    attr.title[lang] || altTitles.find((t: any) => t[lang])?.[lang];
  const fallback = (Object.values(attr.title)[0] as string) || 'No Title';
  return ogLang === 'ja'
    ? findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallback
    : findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallback;
};

const STATUS_STYLE: Record<string, string> = {
  ongoing:   'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  hiatus:    'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const RATING_STYLE: Record<string, string> = {
  safe:          'bg-teal-500/20 text-teal-400',
  suggestive:    'bg-orange-500/20 text-orange-400',
  erotica:       'bg-red-500/20 text-red-400',
  pornographic:  'bg-red-700/30 text-red-400',
};

const SearchCard = memo(function SearchCard({ manga, priority = false }: { manga: any; priority?: boolean }) {
  const attr = manga.attributes;
  const title = getDisplayTitle(manga);
  const description = (attr.description?.en || attr.description?.id || '').replace(/[*_~`\[\]]/g, '').trim();
  const status = attr.status;
  const rating = attr.contentRating;
  const originalLang = attr.originalLanguage;

  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const myProxy = process.env.NEXT_PUBLIC_PROXY;
  const imageUrl = fileName
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
    : `${myProxy}https://og.mangadex.org/og-image/manga/${manga.id}`;

  const statusClass = STATUS_STYLE[status] || 'bg-gray-500/20 text-gray-400';
  const ratingClass = RATING_STYLE[rating] || 'bg-gray-500/20 text-gray-400';

  return (
    <div
      className="bg-[#191A1C] rounded-xl overflow-hidden flex gap-3 p-3 hover:bg-[#1f2024] border border-white/[0.05] hover:border-white/10 transition-colors duration-200 group"
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      {/* Cover */}
      <Link
        href={`/manga/${manga.id}`}
        className="flex-shrink-0 relative overflow-hidden rounded-lg shadow-xl"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="w-[72px] md:w-[100px] aspect-[2/3] bg-gray-900 overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ willChange: 'transform' }}
          />
        </div>
        {/* Flag overlay */}
        <div className="absolute bottom-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent w-full flex justify-end pointer-events-none">
          <img
            src={getFlagUrl(originalLang)}
            alt={originalLang}
            loading="lazy"
            className="w-4 h-auto shadow-sm rounded-[2px] opacity-90"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col min-w-0 gap-1.5">
        {/* Title + badges */}
        <div className="flex flex-col gap-1">
          <Link href={`/manga/${manga.id}`}>
            <h3
              className="text-white font-bold text-sm md:text-base line-clamp-2 group-hover:text-orange-400 transition-colors duration-150 leading-tight"
              title={title}
            >
              {title}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-1">
            <span className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase ${statusClass}`}>
              {status}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase ${ratingClass}`}>
              {rating === 'pornographic' ? '18+' : rating}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {attr.tags.slice(0, 4).map((tag: any) => (
            <span
              key={tag.id}
              className="text-[9px] md:text-[10px] font-semibold bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-tight"
            >
              {tag.attributes.name.en}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 md:line-clamp-3 hidden sm:block">
          {description || 'No description available.'}
        </p>
      </div>
    </div>
  );
});

export default SearchCard;