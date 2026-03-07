// src/components/reader/settings/BehaviorsSettings.tsx 
'use client';
import { ReaderConfig, ScrollPageType } from "@/types/readerTypes";

interface BehaviorsSettingsProps {
    config: ReaderConfig;
    updateConfig: (key: keyof ReaderConfig, value: any) => void;
}

export default function BehaviorsSettings({ config, updateConfig }: BehaviorsSettingsProps) {
    
    const SegmentButton = ({ active, onClick, label }: any) => (
        <button 
            onClick={onClick}
            className={`flex-1 py-2 px-2 text-xs font-medium rounded transition
                ${active ? 'bg-[#4a4d55] text-white' : 'hover:bg-[#32353B] text-gray-400'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Turn pages by scrolling</label>
                <div className="flex bg-[#232529] p-1 rounded">
                    <SegmentButton active={config.turnPageByScroll === 'disabled'} onClick={() => updateConfig('turnPageByScroll', 'disabled')} label="Disabled" />
                    <SegmentButton active={config.turnPageByScroll === 'wheel'} onClick={() => updateConfig('turnPageByScroll', 'wheel')} label="Mouse wheel" />
                    <SegmentButton active={config.turnPageByScroll === 'keyboard'} onClick={() => updateConfig('turnPageByScroll', 'keyboard')} label="Keyboard" />
                    <SegmentButton active={config.turnPageByScroll === 'both'} onClick={() => updateConfig('turnPageByScroll', 'both')} label="Both" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Double click to toggle fullscreen</label>
                <div className="flex bg-[#232529] p-1 rounded">
                    <SegmentButton active={!config.doubleClickFullscreen} onClick={() => updateConfig('doubleClickFullscreen', false)} label="Disabled" />
                    <SegmentButton active={config.doubleClickFullscreen} onClick={() => updateConfig('doubleClickFullscreen', true)} label="Enabled" />
                </div>
            </div>
        </div>
    );
}