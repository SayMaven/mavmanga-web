// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- BAGIAN INI YANG DIPERBARUI ---
export const metadata: Metadata = {
  title: {
    // %s akan diganti dengan judul dari halaman anak (child page)
    template: '%s - SayMaven',
    // Default digunakan jika halaman anak tidak menentukan metadata title
    default: 'SayMaven - Homepage',
  },
  description: "Tempat baca komik gratis dari seluruh dunia dengan berbagai bahasa.",
  icons: {
    icon: [
      // Favicon standar (biasanya 32x32 atau 16x16)
      { url: '/favicon.ico' }, 
      // Icon resolusi tinggi untuk browser modern
      { url: '/logo.png', type: 'image/png' }, 
    ],
    apple: [
      // Icon untuk "Add to Home Screen" di iOS
      // Pastikan file 'apple-icon.png' ada di folder 'public/' projek kamu
      // ATAU ganti url ini dengan link Cloudinary juga jika mau
      { url: '/apple-icon.png' }, 
    ],
  },
};
// ----------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] text-white`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}