// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Berlaku untuk semua bot (Google, Bing, AI, dll)
      disallow: '/',  // Larang mereka menelusuri SEMUA halaman di web ini
    },
  };
}