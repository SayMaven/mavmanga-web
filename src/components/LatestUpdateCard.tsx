// src/components/LatestUpdateCard.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState, memo } from 'react';

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
  return `https://flagcdn.com/w20/${code}.png`;
};

function computeTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TimeAgo = memo(function TimeAgo({ dateString }: { dateString: string }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(computeTimeAgo(dateString));
  }, [dateString]);
  return (
    <span suppressHydrationWarning className="text-gray-500 text-[10px] tabular-nums">
      {label || '...'}
    </span>
  );
});

const getPreferredTitle = (mangaAttr: any): string => {
  if (!mangaAttr) return 'Unknown Title';
  const ogLang = mangaAttr.originalLanguage;
  const altTitles = mangaAttr.altTitles || [];
  const titles = mangaAttr.title || {};
  const findTitle = (lang: string) =>
    titles[lang] || altTitles.find((t: any) => t[lang])?.[lang];
  const fallback = (Object.values(titles)[0] as string) || 'Untitled';
  if (ogLang === 'ja') {
    return findTitle('ja-ro') || findTitle('en') || findTitle('ja') || fallback;
  }
  return findTitle('en') || findTitle(`${ogLang}-ro`) || findTitle(ogLang) || fallback;
};

const LatestUpdateCard = memo(function LatestUpdateCard({ chapter }: { chapter: any }) {
  if (!chapter?.relationships) return null;

  const manga = chapter.relationships.find((r: any) => r.type === 'manga');
  const group = chapter.relationships.find((r: any) => r.type === 'scanlation_group');
  const user = chapter.relationships.find((r: any) => r.type === 'user');

  if (!manga) return null;

  const mangaId = manga.id;
  const mangaTitle = getPreferredTitle(manga.attributes);
  const rawChap = chapter.attributes?.chapter;
  const chapterLabel = rawChap ? `Ch.${rawChap}` : 'Oneshot';
  const title = chapter.attributes?.title;
  const lang = chapter.attributes?.translatedLanguage || 'en';
  const publishAt = chapter.attributes?.readableAt;
  const groupName = group?.attributes?.name || user?.attributes?.username || 'No Group';
  const fileName = chapter.coverFileName;
  const myProxy = process.env.NEXT_PUBLIC_PROXY || '';
  const imageUrl = fileName
    ? `${myProxy}https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
    : `${myProxy}https://og.mangadex.org/og-image/manga/${mangaId}`;

  return (
    <div
      className="flex gap-2 bg-[#1e1f23] hover:bg-[#27292e] border border-white/[0.04] hover:border-white/10 p-2 rounded-lg transition-colors duration-200 group h-[72px] md:h-20"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Thumbnail */}
      <Link
        href={`/manga/${mangaId}`}
        className="w-[48px] md:w-[56px] flex-shrink-0 bg-gray-800 rounded-md overflow-hidden relative"
      >
        <img
          src={imageUrl}
          alt={mangaTitle}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/333/999?text=?';
          }}
        />
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden py-0.5 min-w-0">
        <Link href={`/manga/${mangaId}`} title={mangaTitle}>
          <h4 className="font-bold text-white text-[11px] md:text-sm line-clamp-1 leading-tight group-hover:text-orange-400 transition-colors duration-150">
            {mangaTitle}
          </h4>
        </Link>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <img
              src={getFlagUrl(lang)}
              alt={lang}
              loading="lazy"
              className="w-3.5 md:w-4 h-auto rounded-sm shadow-sm flex-shrink-0"
            />
            <Link
              href={`/read/${chapter.id}`}
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1 min-w-0 transition-colors duration-150"
            >
              <span className="bg-gray-700/80 px-1 py-0.5 rounded font-mono text-[10px] whitespace-nowrap border border-white/5">
                {chapterLabel}
              </span>
              {title && (
                <span className="text-gray-500 truncate max-w-[70px] hidden sm:block text-[10px]">
                  — {title}
                </span>
              )}
            </Link>
          </div>

          <div className="flex justify-between items-end">
            <span
              className="text-[10px] text-orange-400/70 truncate max-w-[80px] md:max-w-[130px]"
              title={groupName}
            >
              {groupName}
            </span>
            <TimeAgo dateString={publishAt} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default LatestUpdateCard;