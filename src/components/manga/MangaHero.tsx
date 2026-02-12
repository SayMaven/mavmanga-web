// src/components/manga/MangaHero.tsx
'use client'; 

import Link from "next/link";
import LibraryButton from "./LibraryButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper: Cari Judul
const getPreferredTitle = (attr: any) => {
    const altTitles = attr.altTitles || [];
    const findAlt = (lang: string) => altTitles.find((t: any) => t[lang])?.[lang];
    const romaji = attr.title["ja-ro"] || findAlt("ja-ro");
    const english = attr.title["en"] || findAlt("en");
    const japanese = attr.title["ja"] || findAlt("ja");
    const mainTitle = romaji || english || japanese || Object.values(attr.title)[0];
    let subTitle = "";
    if (mainTitle === romaji) subTitle = english || japanese;
    else if (mainTitle === english) subTitle = romaji || japanese;
    else subTitle = english;
    return { mainTitle, subTitle };
};

// Kita hapus prop 'chapters' karena sudah tidak dibutuhkan logic lokalnya
export default function MangaHero({ 
    manga, 
    firstChapterId,
}: { 
    manga: any, 
    firstChapterId: string | null,
}) {
  const attr = manga.attributes;
  const { mainTitle, subTitle } = getPreferredTitle(attr);
  const descriptionRaw = attr.description?.en || attr.description?.id || "No description available.";
  
  const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const coverUrl = coverRel?.attributes?.fileName 
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.512.jpg`
    : 'https://placehold.co/300x450/333/999?text=No+Cover';

  const author = manga.relationships.find((r: any) => r.type === 'author')?.attributes?.name || "Unknown";
  const artist = manga.relationships.find((r: any) => r.type === 'artist')?.attributes?.name || "Unknown";

  const genres = attr.tags.filter((t:any) => t.attributes.group === 'genre');
  const themes = attr.tags.filter((t:any) => t.attributes.group === 'theme');
  const formats = attr.tags.filter((t:any) => t.attributes.group === 'format'); 
  const contentRating = attr.contentRating || 'safe';

  // Handler simpan history saat klik
  const handleStartReading = () => {
      if (firstChapterId) {
          try {
              const saved = localStorage.getItem('maven_read_chapters');
              const readSet = saved ? new Set(JSON.parse(saved)) : new Set();
              readSet.add(firstChapterId);
              localStorage.setItem('maven_read_chapters', JSON.stringify(Array.from(readSet)));
          } catch (e) {
              console.error(e);
          }
      }
  };

  return (
    <div className="relative mb-8">
        {/* Background Banner */}
        <div className="absolute inset-0 h-[500px] overflow-hidden z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-[#121212]/40 z-10" />
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={coverUrl} className="w-full h-full object-cover object-[50%_25%] opacity-50 blur-[4px]" alt="Banner" />
        </div>

        <div className="relative z-20 container mx-auto px-4 md:px-6 pt-10">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Floating Cover */}
              <div className="flex-shrink-0 mx-auto md:mx-0 relative group">
                  <div className="w-[200px] md:w-[240px] aspect-[2/3] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 transition-transform group-hover:scale-[1.02]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl} className="w-full h-full object-cover" alt={mainTitle} />
                  </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 flex flex-col pt-2 min-w-0">
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg mb-2">{mainTitle}</h1>
                  {subTitle && <p className="text-lg text-gray-300 mb-2 font-medium opacity-80">{subTitle}</p>}

                  <div className="text-base font-bold text-gray-300 mb-6 flex flex-wrap gap-4">
                      <div className="flex gap-1"><span className="text-orange-500">Author:</span> {author}</div>
                      <div className="flex gap-1"><span className="text-orange-500">Artist:</span> {artist}</div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3 mb-6">
                      {firstChapterId ? (
                          <Link 
                            href={`/read/${firstChapterId}`} 
                            onClick={handleStartReading}
                            className="bg-[#FF6740] hover:bg-[#ff5528] text-white px-6 py-2.5 rounded font-bold shadow-md transition transform active:scale-95 flex items-center gap-2 uppercase text-sm tracking-wide"
                          >
                              Start Reading
                          </Link>
                      ) : (
                          <button disabled className="bg-gray-600/50 text-gray-400 px-6 py-2.5 rounded font-bold cursor-not-allowed uppercase text-sm flex items-center gap-2">
                              No Chapters
                          </button>
                      )}
                      
                      <LibraryButton manga={manga} />
                  </div>

                  {/* TAGS */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-1.5 mb-6 text-[10px] font-bold uppercase leading-none">
                      <span className={`px-2 py-1 rounded text-white border border-transparent
                          ${contentRating === 'erotica' || contentRating === 'pornographic' ? 'bg-red-600' : 
                            contentRating === 'suggestive' ? 'bg-orange-500' : 'bg-green-600'}`}>
                          {contentRating}
                      </span>

                      {formats.map((tag: any) => (
                          <Link key={tag.id} href={`/search?includedTags=${tag.id}`}>
                              <span className={`px-2 py-1 rounded border border-transparent cursor-pointer transition
                                  ${tag.attributes.name.en.toLowerCase() === 'doujinshi' 
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                                    : 'bg-[#3c3e44] hover:bg-[#50535a] text-gray-200 hover:text-white'}`}>
                                  {tag.attributes.name.en}
                              </span>
                          </Link>
                      ))}

                      {[...genres, ...themes].slice(0, 15).map((tag: any) => (
                          <Link key={tag.id} href={`/search?includedTags=${tag.id}`}>
                             <span className="bg-[#3c3e44] hover:bg-[#50535a] text-gray-200 hover:text-white px-2 py-1 rounded cursor-pointer transition">
                                 {tag.attributes.name.en}
                             </span>
                          </Link>
                      ))}

                      <div className="flex items-center gap-1.5 ml-1 text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span>PUBLICATION: {attr.year || 'N/A'}, {attr.status}</span>
                      </div>
                  </div>

                  {/* MARKDOWN DESCRIPTION */}
                  <div className="text-sm text-gray-300 leading-relaxed description-markdown">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold hover:underline inline-flex items-center gap-0.5">{String(props.children).includes('http') ? '[Link]' : props.children}<span className="text-[9px]">↗</span></a>,
                            h3: ({node, ...props}) => <h3 {...props} className="text-white font-bold text-lg mt-4 mb-2 border-l-4 border-orange-500 pl-2" />,
                            h1: ({node, ...props}) => <h1 {...props} className="text-white font-bold text-xl mt-4 mb-2" />,
                            h2: ({node, ...props}) => <h2 {...props} className="text-white font-bold text-lg mt-4 mb-2" />,
                            strong: ({node, ...props}) => <strong {...props} className="text-white font-extrabold" />,
                            ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside ml-2 mb-2 space-y-1" />,
                            ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside ml-2 mb-2 space-y-1" />,
                            p: ({node, ...props}) => <p {...props} className="mb-2 whitespace-pre-line" />,
                            table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded border border-gray-700"><table {...props} className="w-full text-left text-sm" /></div>,
                            thead: ({node, ...props}) => <thead {...props} className="bg-[#232529] text-white uppercase font-bold" />,
                            tbody: ({node, ...props}) => <tbody {...props} className="divide-y divide-gray-700" />,
                            tr: ({node, ...props}) => <tr {...props} className="hover:bg-white/5 transition" />,
                            th: ({node, ...props}) => <th {...props} className="px-4 py-3 border-r border-gray-700 last:border-r-0" />,
                            td: ({node, ...props}) => <td {...props} className="px-4 py-2 border-r border-gray-700 last:border-r-0" />,
                            hr: ({node, ...props}) => <hr {...props} className="border-gray-700 my-4" />,
                        }}
                      >
                          {descriptionRaw}
                      </ReactMarkdown>
                  </div>
              </div>
           </div>
        </div>
    </div>
  );
}