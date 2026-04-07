// src/components/HeroCarousel.tsx
'use client'; 

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Slider, { Settings } from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const getFlagUrl = (lang: string) => {
  const map: Record<string, string> = { 'ja': 'jp', 'ko': 'kr', 'zh': 'cn', 'zh-hk': 'hk', 'en': 'gb', 'id': 'id' };
  const countryCode = map[lang];
  return countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : null;
};

function NextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} !z-30 !right-4 md:!right-8 !w-14 !h-14 !flex !items-center !justify-center before:!content-['›'] before:!text-6xl before:!text-white hover:bg-black/40 rounded-full transition opacity-0 group-hover:opacity-100 duration-300`}
      style={{ ...style }}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
    />
  );
}

function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} !z-30 !left-4 md:!left-8 !w-14 !h-14 !flex !items-center !justify-center before:!content-['‹'] before:!text-6xl before:!text-white hover:bg-black/40 rounded-full transition opacity-0 group-hover:opacity-100 duration-300`}
      style={{ ...style }}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
    />
  );
}

export default function HeroCarousel({ mangaList }: { mangaList: any[] }) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const settings: Settings = {
    dots: false, 
    infinite: true,
    speed: 600, 
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 7000,
    fade: true, 
    cssEase: 'linear',
    draggable: true,
    swipe: true,
    swipeToSlide: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
  };

  const handleSlideClick = useCallback((id: string) => {
    if (!isDragging) {
      router.push(`/manga/${id}`);
    }
  }, [isDragging, router]);

  if (!mangaList || mangaList.length === 0) return null;

  return (
    <section className="relative w-full bg-[#121212] overflow-hidden group mb-12 select-none">
      
      <div className="absolute top-0 left-0 right-0 z-40 container mx-auto px-4 md:px-10 pt-3 pointer-events-none">
        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md tracking-tight">
          Popular New Titles
        </h2>
      </div>

      <Slider {...settings} className="hero-carousel w-full h-[650px] md:h-[600px]">
        {mangaList.map((manga, index) => {
          const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "No Title";
          const rating = manga.attributes.contentRating;
          const originalLang = manga.attributes.originalLanguage;
          const flagUrl = getFlagUrl(originalLang);
          
          let description = "No description available.";
          if (manga.attributes.description) {
             if (manga.attributes.description.en) description = manga.attributes.description.en;
             else if (manga.attributes.description.id) description = manga.attributes.description.id;
             else if (Object.keys(manga.attributes.description).length > 0) {
                description = Object.values(manga.attributes.description)[0] as string;
             }
          }
          description = description.replace(/[*_~`]/g, '');

          const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
          const fileName = coverRel?.attributes?.fileName;
          const imageUrl = fileName 
            ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
            : 'https://placehold.co/1920x1080/222/999?text=No+Cover';

          const tags = manga.attributes.tags.slice(0, 4).map((t: any) => t.attributes.name.en); 
          const authorName = manga.relationships.find((r:any)=>r.type==='author')?.attributes?.name || "Unknown";

          return (
            <div key={manga.id} className="relative w-full h-[650px] md:h-[600px] outline-none">
              
              <div 
                onClick={() => handleSlideClick(manga.id)}
                className="block w-full h-full cursor-pointer relative"
              >
                {/* LAYER 1: BACKGROUND */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={imageUrl} 
                    alt="bg"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[50%_30%] opacity-100" 
                    onDragStart={(e) => e.preventDefault()} 
                  />
                </div>

                {/* LAYER 2: GRADIENT */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
                <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

                {/* LAYER 3: CONTENT */}
                <div className="absolute inset-0 z-20 container mx-auto px-4 md:px-10 flex items-center h-full">
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 w-full h-full justify-center md:justify-start pt-16 md:pt-0">
                    <div className="flex-shrink-0 relative shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-[1.02] z-30">
                      <div className="w-32 h-48 md:w-72 md:h-[420px] rounded-lg overflow-hidden border border-white/20 bg-gray-900">
                        <img 
                          src={imageUrl} 
                          alt={title} 
                          className="w-full h-full object-cover" 
                          onDragStart={(e) => e.preventDefault()} 
                        />
                        {flagUrl && <img src={flagUrl} className="absolute top-2 right-2 md:top-3 md:right-3 w-6 md:w-8 shadow-md rounded-[3px]" alt="lang" />}
                      </div>
                    </div>

                    <div className="flex-1 text-white space-y-3 md:space-y-6 relative z-30 w-full text-center md:text-left">
                      
                      <div className="space-y-2">
                          {/* JUDUL */}
                          <h1 className="text-2xl md:text-6xl font-black leading-tight md:leading-none drop-shadow-2xl text-white tracking-tight line-clamp-2 md:line-clamp-3">
                              {title}
                          </h1>

                          {/* TAGS */}
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm font-bold uppercase tracking-wide opacity-90">
                              <span className={`px-2 py-0.5 rounded text-white shadow-sm ${rating === 'pornographic' ? 'bg-red-600' : 'bg-orange-600'}`}>
                                {rating === 'pornographic' ? '18+' : rating}
                              </span>
                              {tags.map((tag: string) => (
                                <span key={tag} className="bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 rounded text-gray-100">
                                  {tag}
                                </span>
                              ))}
                          </div>
                      </div>

                      {/* DESKRIPSI */}
                      <p className="text-gray-200 leading-relaxed text-xs md:text-lg drop-shadow-md w-full max-w-5xl line-clamp-3 md:line-clamp-5 px-2 md:px-0">
                        {description}
                      </p>

                      {/* AUTHOR */}
                      <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                          <div className="hidden md:block h-[2px] w-10 bg-orange-500"></div>
                          <p className="text-sm md:text-lg text-white font-bold italic opacity-80">
                            {authorName}
                          </p>
                      </div>

                    </div>
                    
                    <div className="absolute bottom-16 right-4 md:bottom-0 md:top-auto md:right-0 text-white font-black text-6xl md:text-8xl opacity-20 md:opacity-10 pointer-events-none select-none z-0">
                      #{index + 1}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </Slider>
    </section>
  );
}