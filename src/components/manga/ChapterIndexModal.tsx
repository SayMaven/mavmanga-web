// src/components/manga/ChapterIndexModal.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import ChapterRow from './ChapterRow';

interface ChapterIndexModalProps {
    isOpen: boolean;
    onClose: () => void;
    chapters: any[]; 
    readChapters: Set<string>;
    onToggleRead: (e: React.MouseEvent, id: string) => void;
    onMarkRead: (id: string) => void;
}

// --- TIPE DATA ---
interface GroupedChapter {
    chapNum: string;
    releases: any[]; 
}

interface GroupedVolume {
    vol: string;
    chapters: GroupedChapter[];
}

// --- FILTER INPUT ---
const FilterInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => {
    const handleStep = (step: number) => {
        const currentVal = value === '' ? 0 : parseFloat(value);
        if (isNaN(currentVal)) {
            onChange(step > 0 ? "1" : "");
        } else {
            const newVal = currentVal + step;
            if (newVal <= 0) onChange(""); 
            else onChange(String(newVal));
        }
    };

    return (
        <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm text-gray-400">{label}</label>
            <div className="flex items-center">
                <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-16 bg-[#232529] border border-[#32353b] text-white px-2 py-1.5 text-center text-sm rounded-l focus:outline-none focus:border-orange-500 transition-colors
                    ${value !== '' ? 'border-orange-500' : ''}`}
                    placeholder="0"
                />
                <button onClick={() => handleStep(-1)} className="bg-[#3c3e44] hover:bg-[#4a4d55] px-3 py-1.5 border-y border-r border-[#32353b] text-gray-300 transition hover:text-white">-</button>
                <button onClick={() => handleStep(1)} className="bg-[#3c3e44] hover:bg-[#4a4d55] px-3 py-1.5 border-y border-r border-[#32353b] text-gray-300 rounded-r transition hover:text-white">+</button>
            </div>
        </div>
    );
};

// --- COMPONENT UTAMA ---
export default function ChapterIndexModal({ 
    isOpen, 
    onClose, 
    chapters, 
    readChapters, 
    onToggleRead,
    onMarkRead
}: ChapterIndexModalProps) {
    const [chFilter, setChFilter] = useState('');
    const [volFilter, setVolFilter] = useState('');
    
    // State Expand/Collapse
    const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set());
    const [activeChapterKey, setActiveChapterKey] = useState<string | null>(null);

    // Ref untuk menyimpan state expandedVolumes terakhir
    const expandedVolumesRef = useRef(expandedVolumes);
    useEffect(() => { expandedVolumesRef.current = expandedVolumes; }, [expandedVolumes]);

    // --- LOGIC GROUPING ---
    const groupedData: GroupedVolume[] = useMemo(() => {
        const volGroups: Record<string, Record<string, any[]>> = {};
        
        chapters.forEach((ch) => {
            const vol = ch.attributes.volume || 'none';
            const chapNum = ch.attributes.chapter;

            if (volFilter !== '' && vol !== 'none' && vol !== volFilter) return;

            if (!volGroups[vol]) volGroups[vol] = {};
            if (!volGroups[vol][chapNum]) volGroups[vol][chapNum] = [];
            
            volGroups[vol][chapNum].push(ch);
        });

        const sortedVolKeys = Object.keys(volGroups).sort((a, b) => {
            if (a === 'none') return 1; 
            if (b === 'none') return -1;
            return parseFloat(b) - parseFloat(a);
        });

        return sortedVolKeys.map(volKey => {
            const chapKeys = Object.keys(volGroups[volKey]).sort((a, b) => {
                return parseFloat(b) - parseFloat(a);
            });

            return {
                vol: volKey,
                chapters: chapKeys.map(chKey => ({
                    chapNum: chKey,
                    releases: volGroups[volKey][chKey].sort((a, b) => {
                        const langA = a.attributes.translatedLanguage;
                        const langB = b.attributes.translatedLanguage;
                        if (langA === 'en' && langB !== 'en') return -1;
                        if (langA !== 'en' && langB === 'en') return 1;
                        return 0;
                    })
                }))
            };
        });
    }, [chapters, volFilter]); 

    // --- EFFECT: DEBOUNCED INPUT HANDLER (300ms Delay - LEBIH CEPAT) ---
    useEffect(() => {
        if (!isOpen) return;

        let animationTimeout: NodeJS.Timeout;

        const runFilterLogic = () => {
            if (chFilter !== '') {
                // 1. User Mengetik sesuatu
                let foundKey: string | null = null;
                let targetVol: string | null = null;
                const newExpandedVols = new Set(expandedVolumesRef.current); 

                groupedData.forEach(gVol => {
                    gVol.chapters.forEach(gCh => {
                        if (gCh.chapNum === chFilter) {
                            const uniqueKey = `${gVol.vol}-${gCh.chapNum}`;
                            targetVol = gVol.vol;
                            newExpandedVols.add(gVol.vol); 
                            if (!foundKey) foundKey = uniqueKey;
                        }
                    });
                });

                if (foundKey) {
                    setExpandedVolumes(newExpandedVols);

                    const isVolumeAlreadyOpen = targetVol && expandedVolumesRef.current.has(targetVol);
                    
                    if (isVolumeAlreadyOpen) {
                        setActiveChapterKey(foundKey);
                    } else {
                        // Delay 50ms untuk render DOM volume
                        animationTimeout = setTimeout(() => {
                            setActiveChapterKey(foundKey);
                        }, 50); 
                    }
                } else {
                    setActiveChapterKey(null);
                }

            } else {
                // 2. Input Kosong (Reset)
                setActiveChapterKey(null);
                if (volFilter === '') {
                    setExpandedVolumes(new Set()); 
                }
            }
        };

        // UBAH DARI 500ms KE 300ms AGAR LEBIH RESPONSIF
        const debounceTimer = setTimeout(runFilterLogic, 300);

        return () => {
            clearTimeout(debounceTimer);
            if (animationTimeout) clearTimeout(animationTimeout);
        };
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chFilter, groupedData, isOpen]); 

    // --- INITIAL STATE ---
    useEffect(() => {
        if (isOpen) {
            setExpandedVolumes(new Set()); 
            setChFilter('');
            setVolFilter('');
            setActiveChapterKey(null);
        }
    }, [isOpen]);

    // --- TOGGLE ACTIONS ---
    const toggleVolume = (vol: string) => {
        const newSet = new Set(expandedVolumes);
        if (newSet.has(vol)) newSet.delete(vol);
        else newSet.add(vol);
        setExpandedVolumes(newSet);
    };

    const toggleChapter = (uniqueKey: string) => {
        if (activeChapterKey === uniqueKey) {
            setActiveChapterKey(null);
        } else {
            setActiveChapterKey(uniqueKey);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-[#191a1c] border border-[#32353b] w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[85vh] relative z-10">
                
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-[#32353b] bg-[#1e2025] rounded-t-lg">
                    <div>
                        <h3 className="text-xl font-bold text-white">Index</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">The Index ignores user blocks, group blocks, and language filters.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* FILTERS */}
                <div className="p-4 flex flex-wrap gap-6 border-b border-[#32353b] bg-[#1e2025] items-end">
                    <FilterInput label="Chapter" value={chFilter} onChange={setChFilter} />
                    <FilterInput label="Volume" value={volFilter} onChange={setVolFilter} />
                    
                    <button 
                        onClick={() => { setChFilter(''); setVolFilter(''); }}
                        className="text-red-500 hover:text-red-400 text-sm font-bold h-9 flex items-center px-2 hover:underline mb-0.5 ml-auto sm:ml-0"
                    >
                        Clear
                    </button>
                </div>

                {/* CONTENT LIST */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#191a1c]">
                    {groupedData.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 italic">No chapters found matching criteria.</div>
                    ) : (
                        groupedData.map((group) => {
                            const isVolExpanded = expandedVolumes.has(group.vol);
                            const displayVol = group.vol === 'none' ? 'Volume none' : `Volume ${group.vol}`;
                            
                            const firstCh = group.chapters[0]?.chapNum;
                            const lastCh = group.chapters[group.chapters.length - 1]?.chapNum;
                            const rangeText = firstCh === lastCh ? `Chapter ${firstCh}` : `Chapter ${firstCh} - ${lastCh}`;
                            const totalReleases = group.chapters.reduce((acc, curr) => acc + curr.releases.length, 0);

                            return (
                                <div key={group.vol} className="border border-[#32353b] rounded bg-[#1e2025] overflow-hidden">
                                    
                                    {/* VOLUME HEADER */}
                                    <div 
                                        onClick={() => toggleVolume(group.vol)}
                                        className="flex items-center justify-between px-4 py-3 bg-[#232529] cursor-pointer hover:bg-[#2a2c30] transition select-none group"
                                    >
                                        <span className="font-bold text-white text-sm">{displayVol}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-medium">
                                                {rangeText} ({totalReleases})
                                            </span>
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isVolExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>

                                    {/* LIST CHAPTERS */}
                                    {isVolExpanded && (
                                        <div className="border-t border-[#32353b] animate-in fade-in duration-200">
                                            {group.chapters.map((chGroup) => {
                                                const uniqueKey = `${group.vol}-${chGroup.chapNum}`;
                                                
                                                const isActive = activeChapterKey === uniqueKey;
                                                const displayCh = `Chapter ${chGroup.chapNum}`;

                                                return (
                                                    <div key={uniqueKey} className="border-b border-[#32353b] last:border-0 bg-[#191a1c]">
                                                        
                                                        {/* CHAPTER HEADER */}
                                                        <div 
                                                            onClick={() => toggleChapter(uniqueKey)}
                                                            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition select-none pl-8 border-l-4
                                                            ${isActive 
                                                                ? 'bg-[#2a2c30] border-orange-500' 
                                                                : 'hover:bg-[#232529] border-transparent text-gray-200'}`}
                                                        >
                                                            <span className={`text-sm font-bold ${isActive ? 'text-white' : ''}`}>{displayCh}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-gray-500">{chGroup.releases.length}</span>
                                                                {/* ANIMASI ROTASI LEBIH CEPAT (duration-300) */}
                                                                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isActive ? 'rotate-180 text-orange-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                            </div>
                                                        </div>

                                                        {/* TRANSLATOR LIST - ANIMASI LEBIH CEPAT (duration-300) */}
                                                        <div 
                                                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                                        >
                                                            <div className="overflow-hidden min-h-0">
                                                                <div className="border-t border-[#32353b]/30">
                                                                    {chGroup.releases.map((ch: any) => (
                                                                        <ChapterRow 
                                                                            key={ch.id} 
                                                                            chap={ch} 
                                                                            chapNum={chGroup.chapNum}
                                                                            isRead={readChapters.has(ch.id)}
                                                                            onToggleRead={onToggleRead}
                                                                            onMarkRead={(id) => {
                                                                                onMarkRead(id);
                                                                                onClose(); 
                                                                            }} 
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}