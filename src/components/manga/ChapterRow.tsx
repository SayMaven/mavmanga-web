// src/components/manga/ChapterRow.tsx
'use client';

import Link from "next/link";
import { formatDistanceToNow, isYesterday } from "date-fns"; 
import { getFlagUrl } from "@/utils/chapterUtils";

interface ChapterRowProps {
    chap: any;
    chapNum: string;
    isRead: boolean;
    onToggleRead: (e: React.MouseEvent, id: string) => void;
    onMarkRead: (id: string) => void; 
}

export default function ChapterRow({ chap, chapNum, isRead, onToggleRead, onMarkRead }: ChapterRowProps) {
    
    // --- DATA EXTRACTION ---
    const attr = chap.attributes;
    const lang = attr.translatedLanguage;
    const title = attr.title;
    
    // Scanlation Group
    const groups = chap.relationships.filter((r: any) => r.type === 'scanlation_group');
    const groupName = groups.length > 0 ? groups.map((g: any) => g.attributes?.name).join(', ') : 'No Group';
    const groupId = groups.length > 0 ? groups[0].id : null;

    // User (Uploader)
    const user = chap.relationships.find((r: any) => r.type === 'user');
    const uploader = user?.attributes?.username || 'Unknown';
    const userId = user?.id;
    
    const displayTitle = title ? title : `Chapter ${chapNum}`;
    
    // --- CUSTOM TIME FORMATTER ---
    const formatTime = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        
        // 1. Cek Yesterday (Khusus)
        if (isYesterday(date)) {
            return "Yesterday";
        }

        // 2. Format Jarak Waktu (date-fns defaultnya hari -> bulan -> tahun, tidak pakai week)
        // Opsi addSuffix: true akan menambahkan "ago"
        let distance = formatDistanceToNow(date, { addSuffix: true });

        // 3. Bersihkan kata-kata perkiraan agar lebih tegas
        distance = distance
            .replace(/^about /, '')
            .replace(/^over /, '')
            .replace(/^almost /, '')
            .replace(/^less than a minute/, 'Just now'); // Opsional: untuk yang baru saja rilis

        return distance;
    };

    const timeAgo = formatTime(attr.readableAt);

    return (
        <div 
            className={`relative group border-b border-[#32353b]/30 last:border-0 transition-colors
            ${isRead ? 'bg-[#191a1c] opacity-50' : 'hover:bg-[#2b2d33]'}`}
        >
            {/* 1. LINK UTAMA (Layer Absolute - Klik area kosong untuk baca/mark read) */}
            <Link 
                href={`/read/${chap.id}`}
                onClick={() => onMarkRead(chap.id)}
                className="absolute inset-0 z-0"
                title={`Read ${displayTitle}`}
            />

            {/* CONTAINER FLEX UTAMA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between relative pointer-events-none p-3 sm:px-4 sm:py-3 gap-2"> 
                
                {/* Indikator Warna Kiri (Biru jika belum dibaca) */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isRead ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                
                {/* --- KOLOM KIRI: INFO UTAMA (Title & Group) --- */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    
                    {/* BARIS 1: Mata, Bendera, Judul */}
                    <div className="flex items-center gap-3">
                        {/* Tombol Mata */}
                        <button 
                            onClick={(e) => onToggleRead(e, chap.id)}
                            className="pointer-events-auto relative z-10 text-gray-500 hover:text-gray-300 focus:outline-none transition-colors shrink-0"
                            title={isRead ? "Mark as Unread" : "Mark as Read"}
                        >
                            {isRead ? (
                                // Mata Silang (Unread)
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                                // Mata Buka (Read) - Putih default
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>

                        {/* Bendera */}
                        <div className="w-5 h-3.5 shrink-0" title={lang}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={getFlagUrl(lang) ?? ''} 
                                alt={lang} 
                                className="w-full h-full object-cover rounded-[2px]" 
                            />
                        </div>

                        {/* Judul Chapter */}
                        <span className={`font-bold text-sm truncate ${isRead ? 'text-gray-500' : 'text-white'}`}>
                            {displayTitle}
                        </span>
                    </div>

                    {/* BARIS 2: Group Name (Putih, link aktif) */}
                    <div className="flex items-center gap-2 pl-8">
                        <svg className={`w-3.5 h-3.5 shrink-0 ${isRead ? 'text-gray-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        
                        {groupId ? (
                            <Link 
                                href={`/group/${groupId}`} 
                                className={`pointer-events-auto relative z-10 text-xs font-bold truncate max-w-[200px] hover:underline ${isRead ? 'text-gray-500' : 'text-white/90 hover:text-white'}`}
                            >
                                {groupName}
                            </Link>
                        ) : (
                            <span className={`text-xs font-bold truncate ${isRead ? 'text-gray-500' : 'text-white/90'}`}>{groupName}</span>
                        )}
                    </div>
                </div>

                {/* --- KOLOM KANAN: META DATA (Time & Uploader) --- */}
                <div className="flex flex-row sm:flex-col items-center sm:items-start justify-start sm:justify-center gap-4 sm:gap-1 pl-8 sm:pl-0 min-w-[140px]">
                    
                    {/* BARIS 1: Waktu (FORMAT BARU) */}
                    <div className="flex items-center gap-2 text-xs" title={new Date(attr.readableAt).toLocaleString()}>
                        <svg className={`w-3.5 h-3.5 shrink-0 ${isRead ? 'text-gray-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className={`truncate ${isRead ? 'text-gray-500' : 'text-white/90'}`}>
                            {timeAgo}
                        </span>
                    </div>

                    {/* BARIS 2: Uploader */}
                    <div className="flex items-center gap-2 text-xs">
                        <svg className={`w-3.5 h-3.5 shrink-0 ${isRead ? 'text-gray-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {userId ? (
                            <Link 
                                href={`/user/${userId}`} 
                                className={`pointer-events-auto relative z-10 truncate hover:underline ${isRead ? 'text-gray-500' : 'text-white/90 hover:text-white'}`}
                            >
                                {uploader}
                            </Link>
                        ) : (
                            <span className={`truncate ${isRead ? 'text-gray-500' : 'text-white/90'}`}>Unknown</span>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}