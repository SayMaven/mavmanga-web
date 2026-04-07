// src/components/reader/ReaderSettings.tsx
'use client';

export type FitMode = 'height' | 'width' | 'original';

interface ReaderSettingsProps {
    fitMode: FitMode;
    setFitMode: (mode: FitMode) => void;
}

export default function ReaderSettings({ fitMode, setFitMode }: ReaderSettingsProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Display Settings</h4>
            
            <div className="space-y-2">
                <p className="text-gray-300 text-sm font-medium">Fit Mode</p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'height', label: 'Height', icon: '↕' },
                        { id: 'width', label: 'Width', icon: '↔' },
                        { id: 'original', label: '1:1', icon: 'o' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setFitMode(mode.id as FitMode)}
                            className={`flex flex-col items-center justify-center p-2 rounded border text-xs font-medium transition-all
                                ${fitMode === mode.id 
                                    ? 'bg-orange-600 border-orange-500 text-white' 
                                    : 'bg-[#232529] border-[#32353B] text-gray-400 hover:bg-[#32353B] hover:text-white'
                                }`}
                        >
                            <span className="text-lg mb-1">{mode.icon}</span>
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}