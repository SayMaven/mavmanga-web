import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Untuk Logo & User Avatar
      },
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org', // Untuk Cover Manga utama
      },
      {
        protocol: 'https',
        hostname: 'og.mangadex.org', // Untuk Fallback Image MangaDex
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com', // Untuk Bendera Bahasa
      },
    ],
  },
};

export default nextConfig;