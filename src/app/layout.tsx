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

export const metadata: Metadata = {
  title: {
    template: '%s - SayMaven',
    default: 'SayMaven - Homepage',
  },
  description: "Tempat baca komik gratis dari seluruh dunia dengan berbagai bahasa.",
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' }, 
      { url: '/logo.png', type: 'image/png' }, 
    ],
    apple: [
      { url: '/apple-icon.png' }, 
    ],
  },
};

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