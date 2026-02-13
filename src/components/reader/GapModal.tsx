// src/components/reader/GapModal.tsx
'use client';

interface GapModalProps {
    isOpen: boolean;
    currChapter: string;
    nextChapter: string;
    onCancel: () => void;
    onContinue: () => void;
    onBackToTitle: () => void;
}

export default function GapModal({
    isOpen,
    currChapter,
    nextChapter,
    onCancel,
    onContinue,
    onBackToTitle
}: GapModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1e2025] border border-[#32353b] rounded-lg shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Chapter Gap</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <p className="text-gray-300 text-sm mb-2">There is a gap between the following chapters:</p>
                
                <div className="flex items-center justify-center gap-4 text-2xl font-bold text-white my-6 font-mono">
                    <span>{currChapter}</span>
                    <span className="text-gray-500">❯</span>
                    <span className="text-orange-500">{nextChapter}</span>
                </div>

                <p className="text-gray-400 text-xs mb-6">Do you wish to continue?</p>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onCancel} className="px-4 py-2 rounded bg-[#FF6740] hover:bg-[#ff5528] text-white font-bold text-sm">
                            Cancel
                        </button>
                        <button onClick={onContinue} className="px-4 py-2 rounded bg-[#3c3e44] hover:bg-[#4a4d55] text-white font-bold text-sm">
                            Continue
                        </button>
                    </div>
                    <button onClick={onBackToTitle} className="text-orange-500 hover:text-orange-400 text-xs font-bold mt-2">
                        Back to Title
                    </button>
                </div>
            </div>
        </div>
    );
}