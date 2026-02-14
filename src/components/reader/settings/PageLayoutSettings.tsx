// src/components/reader/settings/PageLayoutSettings.tsx
'use client';

import { ReaderConfig } from "@/types/readerTypes";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { BookOpenIcon, DocumentIcon, QueueListIcon, ViewColumnsIcon, EyeIcon, EyeSlashIcon, RectangleStackIcon, WindowIcon } from "@heroicons/react/24/outline";

interface PageLayoutSettingsProps {
    config: ReaderConfig;
    updateConfig: (key: keyof ReaderConfig, value: any) => void;
}

export default function PageLayoutSettings({ config, updateConfig }: PageLayoutSettingsProps) {
    
    const SegmentButton = ({ active, onClick, label, icon }: any) => (
        <button 
            onClick={onClick}
            className={`flex-1 py-2 px-1 text-[10px] sm:text-xs font-medium rounded flex flex-col items-center justify-center gap-1 transition
                ${active ? 'bg-[#4a4d55] text-white shadow-md' : 'hover:bg-[#32353B] text-gray-400'}`}
        >
            {/* Menggunakan flex center agar ikon SVG berada di tengah */}
            {icon && <span className="text-lg flex items-center justify-center">{icon}</span>}
            <span className="text-center leading-tight">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Page Display Style */}
            <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Page Display Style</label>
                <div className="flex bg-[#232529] p-1 rounded gap-1">
                    <SegmentButton 
                        active={config.pageStyle === 'single'} 
                        onClick={() => updateConfig('pageStyle', 'single')} 
                        label="Single" 
                        icon={<DocumentIcon className="w-5 h-5"/>} 
                    />
                    
                    {/* 2. Gunakan BookOpenIcon disini */}
                    <SegmentButton 
                        active={config.pageStyle === 'double'} 
                        onClick={() => updateConfig('pageStyle', 'double')} 
                        label="Double" 
                        icon={<BookOpenIcon className="w-5 h-5" />} 
                    />

                    <SegmentButton 
                        active={config.pageStyle === 'long-strip'} 
                        onClick={() => updateConfig('pageStyle', 'long-strip')} 
                        label="Long Strip" 
                        icon={<QueueListIcon className="w-5 h-5" />}
                    />
                    <SegmentButton 
                        active={config.pageStyle === 'wide-strip'} 
                        onClick={() => updateConfig('pageStyle', 'wide-strip')} 
                        label="Wide Strip" 
                        icon={<ViewColumnsIcon className="w-5 h-5" />} 
                    />
                </div>
                <p className="text-[10px] text-gray-500">*Double & Wide view are desktop only.</p>
            </div>

            {/* Reading Direction */}
            <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Reading Direction</label>
                <div className="flex bg-[#232529] p-1 rounded gap-1">
                    <SegmentButton
                        active={config.readingDirection === 'ltr'}
                        onClick={() => updateConfig('readingDirection', 'ltr')}
                        label="Left to Right"
                        icon={<ArrowRightCircleIcon className="w-5 h-5"/>} />
                    <SegmentButton
                        active={config.readingDirection === 'rtl'}
                        onClick={() => updateConfig('readingDirection', 'rtl')}
                        label="Right to Left"
                        icon={<ArrowLeftCircleIcon className="w-5 h-5"/>} />
                </div>
            </div>

            {/* Header Visibility */}
             <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Header Visibility</label>
                <div className="flex bg-[#232529] p-1 rounded">
                    <SegmentButton
                        active={!config.headerVisible}
                        onClick={() => updateConfig('headerVisible', false)}
                        label="Hidden"
                        icon={<RectangleStackIcon className="w-5 h-5" />}/>
                    <SegmentButton
                        active={config.headerVisible}
                        onClick={() => updateConfig('headerVisible', true)}
                        label="Shown"
                        icon={<WindowIcon className="w-5 h-5"/>}/>
                </div>
            </div>

            {/* Progress Bar Style */}
            <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Progress Bar Style</label>
                <div className="flex bg-[#232529] p-1 rounded">
                    <SegmentButton
                        active={config.progressBarStyle === 'hidden'}
                        onClick={() => updateConfig('progressBarStyle', 'hidden')}
                        label="Hidden"
                        icon={<EyeSlashIcon className="w-5 h-5" />}/>
                    <SegmentButton
                        active={config.progressBarStyle === 'normal'}
                        onClick={() => updateConfig('progressBarStyle', 'normal')}
                        label="Normal"
                        icon={<EyeIcon className="w-5 h-5" />}/>
                </div>
            </div>
        </div>
    );
}