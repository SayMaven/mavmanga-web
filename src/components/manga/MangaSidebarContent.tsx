// src/components/manga/MangaSidebarContent.tsx
import React from 'react';
import Link from 'next/link';
import { getLinkInfo } from '@/utils/mangaIcons';

const getFlagUrl = (lang: string) => {
  if (!lang) return null;
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
  const code = map[lang.toLowerCase()];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const getLangPriority = (lang: string) => {
    if (lang === 'en') return 1;
    if (lang === 'ja') return 2;
    if (lang === 'ja-ro') return 3;
    return 100;
};

export default async function MangaSidebarContent({ manga, recommendations = [] }: { manga: any; recommendations?: any[] }) {
  const attr = manga.attributes || {};
  const tags = attr.tags || [];

  const genres = tags.filter((t:any) => t.attributes.group === 'genre');
  const themes = tags.filter((t:any) => t.attributes.group === 'theme');
  const formats = tags.filter((t:any) => t.attributes.group === 'format');
  const author = manga.relationships.find((r: any) => r.type === 'author')?.attributes?.name;
  const artist = manga.relationships.find((r: any) => r.type === 'artist')?.attributes?.name;
  const altTitles = attr.altTitles || [];
  const sortedAltTitles = [...altTitles].sort((a: any, b: any) => {
      const langA = Object.keys(a)[0];
      const langB = Object.keys(b)[0];
      return getLangPriority(langA) - getLangPriority(langB);
  });

  const externalLinks = attr.links || {};
  const linkKeys = Object.keys(externalLinks);
  const trackKeys = ['mal', 'al', 'kt', 'mu', 'ap'];
  const retailKeys = ['raw', 'eng', 'bw', 'amz', 'ebj', 'cdj', 'engtl'];
  const trackLinks = linkKeys.filter(k => trackKeys.includes(k));
  const retailLinks = linkKeys.filter(k => retailKeys.includes(k) || !trackKeys.includes(k)); 


  const mainTitle = attr.title?.en || Object.values(attr.title || {})[0] || '';

  const LinkButton = ({ linkKey, url }: { linkKey: string, url: string }) => {
      const info = getLinkInfo(linkKey, url);
      return (
          <a href={url} target="_blank" rel="noopener noreferrer" 
            className="flex items-center gap-2 bg-[#232529] hover:bg-[#2f3136] border border-[#32353b] hover:border-gray-500 rounded px-3 py-2 transition group"
          >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-white/5 rounded-sm p-0.5 group-hover:bg-white/10 transition">
                  {info.iconSrc ? (
      <img src={info.iconSrc} alt={info.label} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
                      </svg>
                  )}
              </div>
              <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">{info.label}</span>
          </a>
      );
  };

  return (
    <div className="pt-1.5">
        
        {/* 1. AUTHOR & ARTIST */}
        {(author || artist) && (
            <div className="grid grid-cols-2 gap-4 relative z-10 mb-8">
                {author && (
                    <div className="space-y-1 flex flex-col">
                        <h3 className="text-white font-bold text-xs uppercase opacity-70 mb-1">Author</h3>
                        <div className="bg-[#232529] border border-[#32353b] rounded px-3 py-2 text-white text-xs font-bold  truncate w-fit max-w-full hover:border-gray-500 transition cursor-default" title={author}>{author}</div>
                    </div>
                )}
                {artist && (
                    <div className="space-y-1 flex flex-col">
                        <h3 className="text-white font-bold text-xs uppercase opacity-70 mb-1">Artist</h3>
                        <div className="bg-[#232529] border border-[#32353b] rounded px-3 py-2 text-white text-xs font-bold truncate w-fit max-w-full hover:border-gray-500 transition cursor-default" title={artist}>{artist}</div>
                    </div>
                )}
            </div>
        )}

        {/* 2. GENRES */}
        {genres.length > 0 && (
            <div className="space-y-2 relative z-10 mb-8">
                <h3 className="text-white font-bold text-sm mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                    {genres.map((tag: any) => (
                        <Link key={tag.id} href={`/search?includedTags=${tag.id}`}>
                            <span className="bg-[#232529] hover:bg-[#2f3136] border border-[#32353b] hover:border-gray-500 text-gray-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer inline-block">{tag.attributes.name.en}</span>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* 3. THEMES */}
        {themes.length > 0 && (
            <div className="space-y-2 mb-8">
                <h3 className="text-white font-bold text-sm mb-2">Themes</h3>
                <div className="flex flex-wrap gap-2">
                    {themes.map((tag: any) => (
                        <Link key={tag.id} href={`/search?includedTags=${tag.id}`}>
                            <span className="bg-[#232529] hover:bg-[#2f3136] border border-[#32353b] hover:border-gray-500 text-gray-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer inline-block">{tag.attributes.name.en}</span>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* 4. FORMAT */}
        {formats.length > 0 && (
            <div className="space-y-2 mb-8">
                <h3 className="text-white font-bold text-sm mb-2">Format</h3>
                <div className="flex flex-wrap gap-2">
                    {formats.map((tag: any) => (
                        <span key={tag.id} className="bg-[#232529] border border-[#32353b] text-gray-300 px-2 py-1 rounded text-[10px] font-bold inline-block">{tag.attributes.name.en}</span>
                    ))}
                </div>
            </div>
        )}

        {/* 5. READ OR BUY */}
        {retailLinks.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-white/5 mb-8">
                <h3 className="text-white font-bold text-sm mb-2">Read or Buy</h3>
                <div className="flex flex-wrap gap-2">
                    {retailLinks.map((key) => {
                        let url = externalLinks[key] || ""; 
                        if (url) {
                            if (key === 'amz' && !url.includes('http')) url = `https://www.amazon.co.jp/dp/${url}`;
                            if (key === 'bw' && !url.includes('http')) url = `https://bookwalker.jp/${url}`;
                            if (key === 'ebj' && !url.includes('http')) url = `https://ebookjapan.yahoo.co.jp/books/${url}`;
                            if (key === 'cdj' && !url.includes('http')) url = `https://www.cdjapan.co.jp/product/${url}`;
                        }
                        return <LinkButton key={key} linkKey={key} url={url} />;
                    })}
                </div>
            </div>
        )}

        {/* 6. TRACK */}
        {trackLinks.length > 0 && (
            <div className="space-y-2 mb-8">
                <h3 className="text-white font-bold text-sm mb-2">Track</h3>
                <div className="flex flex-wrap gap-2">
                    {trackLinks.map((key) => {
                         let url = externalLinks[key] || "";
                         if (url) {
                             if (key === 'mal') url = `https://myanimelist.net/manga/${url}`;
                             if (key === 'al') url = `https://anilist.co/manga/${url}`;
                             if (key === 'ap') url = `https://www.anime-planet.com/manga/${url}`;
                             if (key === 'kt') url = `https://kitsu.io/manga/${url}`;
                             if (key === 'mu') url = `https://www.mangaupdates.com/series.html?id=${url}`;
                         }
                         return <LinkButton key={key} linkKey={key} url={url} />;
                    })}
                </div>
            </div>
        )}

        {/* 7. ALTERNATIVE TITLES */}
        {sortedAltTitles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5 mb-8">
                <h3 className="text-white font-bold text-sm mb-2">Alternative Titles</h3>
                <div className="space-y-2">
                    {sortedAltTitles.slice(0, 8).map((t: any, idx: number) => {
                        const langKey = Object.keys(t)[0];
                        const title = Object.values(t)[0] as string;
                        const flagUrl = getFlagUrl(langKey);
                        return (
                            <div key={idx} className="flex items-start gap-3 border-b border-white/5 last:border-0 pb-2">
                                <div className="flex-shrink-0 mt-0.5">
                              {flagUrl ? <img src={flagUrl} alt={langKey} loading="lazy" decoding="async" className="w-6 h-4 object-cover rounded shadow-sm opacity-90" /> : <div className="w-6 h-4 bg-[#2b2d33] border border-white/10 rounded flex items-center justify-center"><span className="text-[9px] font-bold uppercase text-gray-400 leading-none">{langKey.slice(0,2)}</span></div>}
                                </div>
                                <span className="text-sm text-gray-300 font-medium leading-tight break-words">{title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* 8. RECOMMENDATIONS */}
        {recommendations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-white font-bold text-sm mb-3">Recommendations</h3>
                <div className="grid grid-cols-2 gap-2.5">
                    {recommendations.slice(0, 6).map((rec: any) => {
                        const recTitle = rec.attributes.title.en || Object.values(rec.attributes.title)[0] as string;
                        const recCover = rec.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
                        const myProxy = process.env.NEXT_PUBLIC_PROXY;
                        const recImage = recCover
                            ? `${myProxy}https://uploads.mangadex.org/covers/${rec.id}/${recCover}.256.jpg`
                            : `https://placehold.co/200x300/1a1b1e/444?text=No+Cover`;
                        return (
                            <a key={rec.id} href={`/manga/${rec.id}`}
                                className="group relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-white/[0.06] bg-[#1a1b1e] hover:border-orange-500/30 transition-colors"
                            >
                                <img
                                    src={recImage}
                                    referrerPolicy="no-referrer"
                                    alt={recTitle}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">
                                        {recTitle}
                                    </p>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        )}

    </div>
  );
}