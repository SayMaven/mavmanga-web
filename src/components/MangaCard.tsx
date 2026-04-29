// src/components/MangaCard.tsx
'use client';

import Link from 'next/link';
import { memo } from 'react';

// MangaDex supported language → ISO 3166-1 alpha-2 country code (for flagcdn.com)
// Full reference: https://mangadex.org/languages
const FLAG_MAP: Record<string, string> = {
  // ── East Asia ──────────────────────────────────────────────────────────
  'ja':    'jp',   // Japanese
  'ko':    'kr',   // Korean
  'zh':    'cn',   // Chinese Simplified
  'zh-hk': 'hk',  // Chinese Traditional (Hong Kong)

  // ── Southeast Asia ─────────────────────────────────────────────────────
  'id':   'id',    // Indonesian
  'vi':   'vn',    // Vietnamese
  'th':   'th',    // Thai
  'tl':   'ph',    // Filipino / Tagalog
  'ms':   'my',    // Malay
  'my':   'mm',    // Burmese / Myanmar
  'km':   'kh',    // Khmer / Cambodian
  'lo':   'la',    // Lao

  // ── South Asia ─────────────────────────────────────────────────────────
  'hi':   'in',    // Hindi
  'bn':   'bd',    // Bengali
  'ta':   'lk',    // Tamil (Sri Lanka flag; also spoken in India)
  'ne':   'np',    // Nepali
  'ur':   'pk',    // Urdu
  'si':   'lk',    // Sinhala

  // ── Middle East & Central Asia ─────────────────────────────────────────
  'ar':   'sa',    // Arabic
  'fa':   'ir',    // Persian / Farsi
  'he':   'il',    // Hebrew
  'tr':   'tr',    // Turkish
  'az':   'az',    // Azerbaijani
  'kk':   'kz',    // Kazakh
  'uz':   'uz',    // Uzbek
  'ky':   'kg',    // Kyrgyz
  'ka':   'ge',    // Georgian

  // ── Central/North Asia ─────────────────────────────────────────────────
  'mn':   'mn',    // Mongolian

  // ── Western Europe ─────────────────────────────────────────────────────
  'en':   'gb',    // English
  'fr':   'fr',    // French
  'de':   'de',    // German
  'es':   'es',    // Spanish (Spain)
  'es-la': 'mx',   // Spanish (Latin America)
  'pt':   'pt',    // Portuguese (Portugal)
  'pt-br': 'br',   // Portuguese (Brazil)
  'it':   'it',    // Italian
  'nl':   'nl',    // Dutch
  'ca':   'es-ct', // Catalan (Catalonia regional flag)

  // ── Northern Europe ────────────────────────────────────────────────────
  'sv':   'se',    // Swedish
  'no':   'no',    // Norwegian (Bokmål)
  'nn':   'no',    // Norwegian (Nynorsk) — same flag
  'da':   'dk',    // Danish
  'fi':   'fi',    // Finnish

  // ── Eastern Europe ─────────────────────────────────────────────────────
  'ru':   'ru',    // Russian
  'pl':   'pl',    // Polish
  'uk':   'ua',    // Ukrainian
  'cs':   'cz',    // Czech
  'sk':   'sk',    // Slovak
  'hu':   'hu',    // Hungarian
  'ro':   'ro',    // Romanian
  'bg':   'bg',    // Bulgarian

  // ── South/Southwest Europe ─────────────────────────────────────────────
  'el':   'gr',    // Greek
  'sr':   'rs',    // Serbian
  'hr':   'hr',    // Croatian
  'sl':   'si',    // Slovenian
  'mk':   'mk',    // Macedonian
  'sq':   'al',    // Albanian
  'lt':   'lt',    // Lithuanian
  'lv':   'lv',    // Latvian
  'et':   'ee',    // Estonian

  // ── Africa ─────────────────────────────────────────────────────────────
  'af':   'za',    // Afrikaans
  'sw':   'tz',    // Swahili
  'am':   'et',    // Amharic

  // ── Special / Constructed ──────────────────────────────────────────────
  'la':   'va',    // Latin (Vatican City flag)
  'eo':   'un',    // Esperanto (UN flag — no native country)

  // ── Romanized Variants ─────────────────────────────────────────────────
  'ja-ro': 'jp',   // Japanese (Romanized)
  'ko-ro': 'kr',   // Korean (Romanized)
  'zh-ro': 'cn',   // Chinese (Romanized)
};

const getFlagUrl = (lang: string) => {
  const code = FLAG_MAP[lang] || 'xx';
  return `https://flagcdn.com/w40/${code}.png`;
};

const getDisplayTitle = (manga: any): string => {
  const attr = manga.attributes;
  const ogLang = attr.originalLanguage;
  const altTitles = attr.altTitles || [];
  const titles = attr.title || {};
  const findTitle = (lang: string) =>
    titles[lang] || altTitles.find((t: any) => t[lang])?.[lang];
  const fallback = (Object.values(titles)[0] as string) || 'No Title';
  if (ogLang === 'ja') {
    return findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallback;
  }
  return findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallback;
};

const RATING_BADGE: Record<string, string> = {
  safe: 'bg-emerald-600',
  suggestive: 'bg-amber-500',
  erotica: 'bg-rose-600',
  pornographic: 'bg-purple-700',
};

const STATUS_BADGE: Record<string, string> = {
  ongoing: 'bg-blue-600',
  completed: 'bg-teal-600',
  hiatus: 'bg-orange-500',
  cancelled: 'bg-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  ongoing: 'ONGOING',
  completed: 'END',
  hiatus: 'HIATUS',
  cancelled: 'CANCEL',
};

const MangaCard = memo(function MangaCard({
  manga,
  priority = false,
  className = '',
}: {
  manga: any;
  priority?: boolean;
  className?: string;
}) {
  const attr = manga.attributes;
  const originalLang = attr.originalLanguage;
  const title = getDisplayTitle(manga);
  const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;
  const myProxy = process.env.NEXT_PUBLIC_PROXY || '';
  const imageUrl = fileName
    ? `${myProxy}https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
    : `${myProxy}https://og.mangadex.org/og-image/manga/${manga.id}`;

  const rating = attr.contentRating;
  const status = attr.status;
  const ratingClass = RATING_BADGE[rating] || 'bg-gray-600';
  const statusClass = STATUS_BADGE[status] || 'bg-gray-600';

  return (
    <div className={`relative group w-full ${className}`} style={{ transform: 'translateZ(0)' }}>
      <Link
        href={`/manga/${manga.id}`}
        className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#1c1c1c] shadow-md"
        style={{ willChange: 'transform' }}
      >
        {/* Cover image */}
        <img
          src={imageUrl}
          alt={title}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
          style={{ transform: 'translateZ(0)' }}
        />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10">
          <span
            className={`${ratingClass} text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow uppercase tracking-wider`}
          >
            {rating === 'pornographic' ? '18+' : rating}
          </span>
          {status && (
            <span
              className={`${statusClass} text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow uppercase tracking-wider`}
            >
              {STATUS_LABEL[status] || status}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/8 transition-colors duration-300"
          style={{ transform: 'translateZ(0)' }}
        />

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 w-full px-2.5 pb-2.5 pt-8 z-10">
          <h3 className="text-white font-bold text-[11px] md:text-xs leading-tight group-hover:text-orange-400 transition-colors duration-200 line-clamp-2 drop-shadow-md">
            {title}
          </h3>
          <div className="flex justify-end mt-1.5">
            <img
              src={getFlagUrl(originalLang)}
              alt={originalLang}
              loading="lazy"
              className="w-5 h-auto rounded-sm shadow-sm border border-white/10"
            />
          </div>
        </div>

        {/* Right-edge orange accent */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[2px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ transform: 'translateZ(0)' }}
        />
      </Link>
    </div>
  );
});

export default MangaCard;