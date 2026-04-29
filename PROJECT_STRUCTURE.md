# MavenManga — Struktur Project

> Platform baca manga online berbasis **Next.js 16** yang menggunakan MangaDex API sebagai sumber data,
> dengan arsitektur App Router, Server Components, dan optimasi performa untuk perangkat spek rendah.

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| **Next.js** | 16.1.6 | Framework utama (App Router, Server Components, Server Actions) |
| **React** | 19.2.3 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Styling utility-first |
| **@heroicons/react** | ^2.2.0 | Icon SVG library |
| **date-fns** | ^4.1.0 | Format tanggal chapter |
| **react-markdown** | ^10.1.0 | Render deskripsi manga (Markdown) — *hanya digunakan di beberapa tempat* |
| **remark-gfm** | ^4.0.1 | Plugin GitHub Flavored Markdown |
| **react-slick** | ^0.31.0 | Carousel slider (HeroCarousel) |
| **undici** | ^7.20.0 | HTTP client untuk fetch di Server Actions |
| **flagcdn.com** | — | Sumber gambar bendera bahasa (CDN eksternal) |

### Dev Dependencies
| Paket | Kegunaan |
|---|---|
| `@tailwindcss/postcss` | PostCSS integration Tailwind v4 |
| `babel-plugin-react-compiler` | React Compiler (experimental) |
| `eslint` + `eslint-config-next` | Linting |

---

## Struktur Direktori

```
mavmanga-web/
├── src/
│   ├── app/                    ← Next.js App Router (pages & layouts)
│   │   ├── layout.tsx          ← Root layout (Navbar, font, metadata global)
│   │   ├── page.tsx            ← Homepage
│   │   ├── globals.css         ← Global styles, Tailwind directives, custom scrollbar
│   │   ├── actions.ts          ← Server Actions (fetch tags, chapter pages, quick search)
│   │   ├── robots.ts           ← SEO robots.txt config
│   │   ├── library/
│   │   │   └── page.tsx        ← Halaman My Library
│   │   ├── manga/
│   │   │   ├── latest/
│   │   │   │   └── page.tsx    ← Halaman Latest Manga (semua chapter terbaru)
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← Halaman detail manga (dynamic route)
│   │   ├── read/
│   │   │   └── [chapterId]/
│   │   │       └── page.tsx    ← Halaman reader (dynamic route)
│   │   └── search/
│   │       └── page.tsx        ← Halaman pencarian manga
│   │
│   ├── components/             ← Semua UI components (reusable)
│   │   ├── ContentWarning.tsx  ← Modal peringatan konten dewasa
│   │   ├── DraggableScroll.tsx ← Container horizontal drag-to-scroll
│   │   ├── HeroCarousel.tsx    ← Hero banner utama di homepage (slider)
│   │   ├── LatestUpdateCard.tsx← Card & grid chapter terbaru (homepage)
│   │   ├── MangaCard.tsx       ← Card manga (dipakai di grid/carousel)
│   │   ├── MangaSection.tsx    ← Section wrapper (judul + grid manga)
│   │   ├── Navbar.tsx          ← Navigasi global (search bar, links)
│   │   ├── Pagination.tsx      ← Komponen paginasi universal
│   │   ├── SearchCard.tsx      ← Card hasil pencarian (search page)
│   │   ├── SearchContent.tsx   ← Logic & UI lengkap halaman search
│   │   ├── SearchInput.tsx     ← Input pencarian dengan quick-search dropdown
│   │   │
│   │   ├── filters/            ← Filter components untuk halaman search
│   │   │   ├── ArtistFilter.tsx
│   │   │   ├── AuthorFilter.tsx
│   │   │   ├── ContentRatingFilter.tsx
│   │   │   ├── DemographicFilter.tsx
│   │   │   ├── LanguageFilter.tsx
│   │   │   ├── SortByFilter.tsx
│   │   │   ├── StatusFilter.tsx
│   │   │   ├── TagFilter.tsx
│   │   │   └── TranslatedLanguageFilter.tsx
│   │   │
│   │   ├── library/
│   │   │   └── LibraryContent.tsx  ← UI lengkap halaman My Library
│   │   │
│   │   ├── manga/              ← Components khusus halaman detail manga
│   │   │   ├── ChapterIndexModal.tsx  ← Modal index chapter (jump ke chapter)
│   │   │   ├── ChapterList.tsx        ← Daftar chapter dengan grouping volume
│   │   │   ├── ChapterRow.tsx         ← Satu baris chapter dalam daftar
│   │   │   ├── LibraryButton.tsx      ← Tombol Add/Update library di halaman manga
│   │   │   ├── MangaHero.tsx          ← Hero section detail manga (cover, judul, tags)
│   │   │   ├── MangaSidebar.tsx       ← Wrapper sidebar kanan detail manga
│   │   │   ├── MangaSidebarContent.tsx← Isi sidebar (genres, links, alt titles, recs)
│   │   │   └── MangaTabs.tsx          ← Tab navigation (Chapters / Art / Recommendations)
│   │   │
│   │   └── reader/             ← Components khusus halaman baca manga
│   │       ├── GapModal.tsx           ← Modal konfirmasi saat ada gap chapter
│   │       ├── ReaderHeader.tsx       ← Header overlay reader (judul, halaman, menu)
│   │       ├── ReaderProgressBar.tsx  ← Progress bar bawah reader
│   │       ├── ReaderSettings.tsx     ← Panel pengaturan reader (inline)
│   │       ├── ReaderSettingsModal.tsx← Modal pengaturan reader lengkap
│   │       ├── ReaderSidebar.tsx      ← Sidebar kanan reader (navigation, settings)
│   │       ├── ReaderViewer.tsx       ← Komponen utama reader (gambar, navigasi, mode)
│   │       └── settings/              ← Sub-panel pengaturan reader
│   │           ├── BehaviorsSettings.tsx  ← Pengaturan behavior (scroll, keyboard)
│   │           ├── ImageFitSettings.tsx   ← Pengaturan fit gambar
│   │           └── PageLayoutSettings.tsx ← Pengaturan layout halaman (single/double/strip)
│   │
│   ├── hooks/
│   │   └── useMediaQuery.ts    ← Custom hook untuk deteksi breakpoint responsive
│   │
│   ├── services/
│   │   └── mangadex.ts         ← Semua fungsi fetch ke MangaDex API (satu-satunya
│   │                             layer yang berkomunikasi langsung dengan API)
│   │
│   ├── types/
│   │   └── readerTypes.ts      ← TypeScript types untuk konfigurasi reader
│   │                             (ReaderConfig, PageStyle, ReadingDirection, dll)
│   │
│   └── utils/
│       ├── chapterUtils.ts     ← Fungsi utilitas chapter (getFlagUrl, format label)
│       └── mangaIcons.tsx      ← Mapping link eksternal → icon + label (MAL, AL, dll)
│
├── .env.local                  ← Environment variables (NEXT_PUBLIC_PROXY)
├── .gitignore
├── CHANGELOG.txt               ← Catatan perubahan sesi optimasi
├── eslint.config.mjs           ← Konfigurasi ESLint
├── next.config.ts              ← Konfigurasi Next.js (image domains, dll)
├── next-env.d.ts               ← Type declarations Next.js (auto-generated)
├── package.json                ← Dependencies & scripts
├── postcss.config.mjs          ← PostCSS config (Tailwind v4)
├── README.md                   ← Dokumentasi awal project
├── tsconfig.json               ← Konfigurasi TypeScript (path alias @/)
└── tsconfig.tsbuildinfo        ← Cache TypeScript build (auto-generated)
```

---

## Alur Data (Data Flow)

```
Browser Request
     │
     ▼
┌─────────────────────────────────────────────┐
│  Next.js App Router (Server Component)      │
│  src/app/[route]/page.tsx                   │
│                                             │
│  Fetch data dari mangadex.ts ───────────────┼──► MangaDex API
│  (getMangaDetail, getMangaFeed, dll)        │    (via PROXY)
└──────────────┬──────────────────────────────┘
               │ Props (server → client)
               ▼
┌─────────────────────────────────────────────┐
│  Client Components ('use client')           │
│  ReaderViewer, SearchContent, ChapterList,  │
│  LibraryContent, dll                        │
│                                             │
│  State management: useState, useMemo        │
│  Side effects: useEffect, localStorage      │
└─────────────────────────────────────────────┘
               │
               │ Server Actions (untuk fetch dari client)
               ▼
┌─────────────────────────────────────────────┐
│  src/app/actions.ts ('use server')          │
│  fetchTagsServer()                          │
│  fetchChapterPagesServer()                  │
│  fetchQuickSearchServer()                   │
└─────────────────────────────────────────────┘
```

---

## Halaman & Routing

| Route | File | Tipe | Deskripsi |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | Homepage: HeroCarousel + Latest Updates + Seasonal |
| `/search` | `app/search/page.tsx` | Server + Client | Pencarian dengan filter lengkap |
| `/manga/[id]` | `app/manga/[id]/page.tsx` | Server | Detail manga: hero, chapter list, sidebar |
| `/manga/latest` | `app/manga/latest/page.tsx` | Server | Semua chapter terbaru (paginated) |
| `/read/[chapterId]` | `app/read/[chapterId]/page.tsx` | Server + Client | Reader manga |
| `/library` | `app/library/page.tsx` | Client | My Library (localStorage-based) |

---

## Layer Service — `src/services/mangadex.ts`

Satu-satunya file yang berinteraksi dengan MangaDex API. Semua request diproksikan
melalui `NEXT_PUBLIC_PROXY` untuk menghindari CORS dan pemblokiran ISP.

| Fungsi | Kegunaan |
|---|---|
| `getMangaList()` | Ambil daftar manga (homepage, seasonal) |
| `getMangaDetail(id)` | Detail lengkap satu manga |
| `getMangaFeed(id, offset, order, limit)` | Daftar chapter manga |
| `getMangaCovers(id)` | Semua cover art manga |
| `getMangaRecommendations(title, tags, demographic, excludeId)` | Rekomendasi manga serupa |
| `getMangaTags()` | Semua tag tersedia (untuk filter search) |
| `getChapterPages(chapterId)` | URL gambar halaman chapter |
| `getLatestUpdates(page)` | Chapter terbaru global |
| `getQuickSearch(query)` | Pencarian cepat (untuk search dropdown) |
| `getSeasonalManga()` | Manga seasonal dari MangaDex list |

---

## Penyimpanan Lokal (localStorage)

Data disimpan di browser pengguna — tidak ada backend/database.

| Key | Isi | Dipakai di |
|---|---|---|
| `maven_library` | Array manga + status baca | `LibraryContent.tsx`, `LibraryButton.tsx` |
| `maven_read_chapters` | Set ID chapter yang sudah dibaca | `ChapterList.tsx`, `ReaderViewer.tsx` |
| `maven_reader_config` | Konfigurasi reader (layout, fit, dll) | `ReaderViewer.tsx` |
| `maven_reader_sidebar` | State sidebar reader (open/close) | `ReaderViewer.tsx` |

---

## Konfigurasi Reader (`ReaderConfig`)

Didefinisikan di `src/types/readerTypes.ts`:

```typescript
interface ReaderConfig {
  pageStyle: 'single' | 'double' | 'long-strip' | 'wide-strip';
  readingDirection: 'ltr' | 'rtl';
  headerVisible: boolean;
  progressBarStyle: 'hidden' | 'normal';
  cursorHint: 'none' | 'overlay' | 'cursor';
  fitMode: 'height' | 'width' | 'original';
  imageSizing: {
    containWidth: boolean;
    containHeight: boolean;
    stretchSmall: boolean;
    maxWidth: boolean;
    maxHeight: boolean;
  };
  turnPageByScroll: 'disabled' | 'wheel' | 'keyboard' | 'both';
  doubleClickFullscreen: boolean;
}
```

---

## Environment Variables

File: `.env.local` (tidak di-commit ke repository)

```env
NEXT_PUBLIC_PROXY=https://your-proxy-url/
```

`NEXT_PUBLIC_PROXY` — URL proxy yang mem-forward semua request ke MangaDex API.
Digunakan di semua fetch (baik Server Component maupun Client Component) karena
prefix `NEXT_PUBLIC_` membuatnya tersedia di sisi client.

---

## Next.js Config (`next.config.ts`)

```typescript
images: {
  unoptimized: true,          // Gunakan <img> biasa, bukan next/image
  remotePatterns: [
    'res.cloudinary.com',     // Logo & user avatar
    'uploads.mangadex.org',   // Cover manga & halaman chapter
    'og.mangadex.org',        // Fallback OG image
    'flagcdn.com',            // Gambar bendera bahasa
  ]
}
```

> **Catatan:** `unoptimized: true` digunakan karena gambar diproksikan melalui
> middleware eksternal, sehingga optimasi Next.js Image tidak diperlukan.

---

## Konvensi Kode

| Aspek | Konvensi |
|---|---|
| **Path alias** | `@/` → `src/` (dikonfigurasi di `tsconfig.json`) |
| **Server vs Client** | Server Component by default; tambah `'use client'` hanya jika perlu interaktivitas |
| **Naming** | PascalCase untuk komponen, camelCase untuk fungsi & variabel |
| **Warna tema** | Background: `#0f0f11`, Accent: `#FF6740` (orange), Card: `#1a1b1e` |
| **Background** | Konsisten `#0f0f11` di semua halaman |
| **Lazy loading** | `loading="lazy"` + `decoding="async"` untuk gambar di bawah fold |
| **GPU hints** | `transform: translateZ(0)` / `willChange: 'transform'` pada elemen animasi |

---

## Scripts

```bash
npm run dev    # Development server (localhost:3000)
npm run build  # Production build
npm run start  # Jalankan production build
npm run lint   # ESLint check
```

---

## Git

| Branch | Kegunaan |
|---|---|
| `main` | Production branch |
| `update` | Branch aktif development (saat ini) |

Remote: `https://github.com/SayMaven/mavmanga-web`
