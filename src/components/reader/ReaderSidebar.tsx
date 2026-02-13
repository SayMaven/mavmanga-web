// src/components/reader/ReaderSidebar.tsx
'use client';

import Link from "next/link";

export type FitMode = 'height' | 'width' | 'original';

interface ReaderSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    fitMode: FitMode;
    setFitMode: (mode: FitMode) => void;
    onPrev: () => void;
    onNext: () => void;
    mangaId: string;
}

export default function ReaderSidebar({
    isOpen,
    onClose,
    fitMode,
    setFitMode,
    onPrev,
    onNext,
    mangaId
}: ReaderSidebarProps) {
    return (
        <>
            <div className={`fixed top-0 right-0 h-full w-[320px] bg-[#191A1C] border-l border-[#32353B] z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header Sidebar */}
                <div className="flex justify-between items-center p-4 border-b border-[#32353B]">
                    <h3 className="text-white font-bold">Reader Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Navigation */}
                    <div className="space-y-2">
                        <p className="text-gray-500 text-xs uppercase font-bold">Navigation</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={onPrev} className="bg-[#232529] hover:bg-[#32353B] text-white py-2 rounded border border-[#32353B] text-sm">← Prev Page</button>
                            <button onClick={onNext} className="bg-[#232529] hover:bg-[#32353B] text-white py-2 rounded border border-[#32353B] text-sm">Next Page →</button>
                        </div>
                    </div>

                    {/* Fit Mode */}
                    <div className="space-y-2">
                        <p className="text-gray-500 text-xs uppercase font-bold">Fit Mode</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => setFitMode('height')} className={`py-2 px-4 rounded text-left text-sm border transition ${fitMode === 'height' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-[#232529] border-[#32353B] text-gray-300'}`}>Fit Height (Default)</button>
                            <button onClick={() => setFitMode('width')} className={`py-2 px-4 rounded text-left text-sm border transition ${fitMode === 'width' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-[#232529] border-[#32353B] text-gray-300'}`}>Fit Width (Scroll)</button>
                            <button onClick={() => setFitMode('original')} className={`py-2 px-4 rounded text-left text-sm border transition ${fitMode === 'original' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-[#232529] border-[#32353B] text-gray-300'}`}>Original Size</button>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="pt-4 border-t border-[#32353B]">
                        <Link href={`/manga/${mangaId}`} className="text-orange-500 text-sm hover:underline block mb-2">Back to Manga Detail</Link>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-[55]" onClick={onClose} />}
        </>
    );
}