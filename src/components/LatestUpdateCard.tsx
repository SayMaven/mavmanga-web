// src/components/LatestUpdateCard.tsx
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

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
  return `https://flagcdn.com/w20/${countryCode}.png`;
};

// --- Helper: TimeAgo ---
const TimeAgo = ({ dateString }: { dateString: string }) => {
  const [timeLabel, setTimeLabel] = useState("");

  useEffect(() => {
    if (!dateString) return;
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) setTimeLabel('Just now');
    else if (diff < 3600) setTimeLabel(`${Math.floor(diff / 60)}m ago`);
    else if (diff < 86400) setTimeLabel(`${Math.floor(diff / 3600)}h ago`);
    else setTimeLabel(`${Math.floor(diff / 86400)}d ago`);
  }, [dateString]);

  return <span suppressHydrationWarning className="text-gray-400 text-[10px] md:text-xs">{timeLabel || "..."}</span>;
};

// --- Helper: Judul Cerdas (Smart Title) ---
const getPreferredTitle = (mangaAttr: any) => {
    if (!mangaAttr) return "Unknown Title";

    const ogLang = mangaAttr.originalLanguage; 
    const altTitles = mangaAttr.altTitles || [];
    const titles = mangaAttr.title || {};

    const findTitle = (lang: string) => {
        return titles[lang] || altTitles.find((t: any) => t[lang])?.[lang];
    };

    // Fallback darurat: Ambil value pertama dari object title
    const fallbackTitle = Object.values(titles)[0] as string || "Untitled";

    let mainTitle = "";

    if (ogLang === 'ja') {
        // --- LOGIC MANGA JEPANG ---
        // Prioritas: Romaji -> English -> Kanji -> Fallback
        mainTitle = findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallbackTitle;
    } else {
        // --- LOGIC MANGA LUAR JEPANG ---
        // Prioritas: English -> Romaji -> Bahasa Asli -> Fallback
        mainTitle = findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallbackTitle;
    }

    return mainTitle;
};

export default function LatestUpdateCard({ chapter }: { chapter: any }) {
  if (!chapter || !chapter.relationships) return null;

  const manga = chapter.relationships.find((r: any) => r.type === 'manga');
  const group = chapter.relationships.find((r: any) => r.type === 'scanlation_group');
  const user = chapter.relationships.find((r: any) => r.type === 'user');

  if (!manga) return null;

  const mangaId = manga.id;
  
  // GUNAKAN LOGIC JUDUL BARU DISINI
  const mangaTitle = getPreferredTitle(manga.attributes);

  const rawChap = chapter.attributes?.chapter;
  const chapterLabel = rawChap ? `Ch.${rawChap}` : "Oneshot";
  const title = chapter.attributes?.title;
  const lang = chapter.attributes?.translatedLanguage || "en";
  const publishAt = chapter.attributes?.readableAt;
  const groupName = group?.attributes?.name || user?.attributes?.username || "No Group";
  const fileName = chapter.coverFileName; // Property khusus hasil inject di service
  
  // Jika coverFileName tidak ada di chapter object (karena API response struktur beda), 
  // Gunakan proxy OG image MangaDex sebagai fallback yang andal
  const imageUrl = fileName 
    ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
    : `https://og.mangadex.org/og-image/manga/${mangaId}`;

  return (
    <div className="flex gap-2 bg-[#232529] hover:bg-[#2f3136] p-2 rounded transition-colors group h-24">
      {/* Thumbnail */}
      <Link href={`/manga/${mangaId}`} className="w-[50px] md:w-[60px] flex-shrink-0 bg-gray-700 rounded overflow-hidden relative">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img 
            src={imageUrl} 
            alt="thumb"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/333/999?text=No+Img';
            }}
         />
      </Link>

      {/* Info Kanan */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden py-0.5 min-w-0">
        
        <Link href={`/manga/${mangaId}`} title={mangaTitle}>
           <h4 className="font-bold text-white text-[11px] md:text-sm line-clamp-1 leading-tight group-hover:text-orange-400 transition-colors">
             {mangaTitle}
           </h4>
        </Link>

        <div className="flex flex-col gap-0.5 mt-1">
           <div className="flex items-center gap-1.5">
              <img src={getFlagUrl(lang)} alt={lang} className="w-3.5 md:w-4 h-auto shadow-sm" />
              <Link href={`/read/${chapter.id}`} className="text-xs text-gray-200 hover:text-white flex items-center gap-1 min-w-0">
                 <span className="bg-gray-700 px-1 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">
                    {chapterLabel}
                 </span>
                 {title && <span className="text-gray-500 truncate max-w-[80px] hidden sm:block">- {title}</span>}
              </Link>
           </div>
           
           <div className="flex justify-between items-end mt-0.5">
              <span className="text-[10px] text-orange-400/80 truncate max-w-[70px] md:max-w-[120px]" title={groupName}>
                {groupName}
              </span>
              <div className="origin-right scale-95 md:scale-100">
                <TimeAgo dateString={publishAt} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}