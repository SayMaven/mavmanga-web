// src/app/library/page.tsx
import { Metadata } from 'next';
import LibraryContent from '@/components/library/LibraryContent';

export const metadata: Metadata = {
  title: 'My Library — MavenManga',
  description: 'Track your manga reading progress. Manage your reading list with status tags like Reading, Completed, On Hold, and more.',
};

export default function LibraryPage() {
  return <LibraryContent />;
}