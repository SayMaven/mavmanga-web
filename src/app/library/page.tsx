// src/app/library/page.tsx
import { Metadata } from 'next';
import LibraryContent from '@/components/library/LibraryContent'; // Import komponen baru

export const metadata: Metadata = {
  title: "Library", 
  // Hasil: "My Library | SayMaven"
};

export default function LibraryPage() {
  return (
    <LibraryContent />
  );
}