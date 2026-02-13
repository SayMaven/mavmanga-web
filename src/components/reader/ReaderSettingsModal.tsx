// src/components/reader/ReaderSettingsModal.tsx
'use client';

import { useState } from "react";
import { ReaderConfig } from "@/types/readerTypes";
import PageLayoutSettings from "./settings/PageLayoutSettings";
import ImageFitSettings from "./settings/ImageFitSettings";
import BehaviorsSettings from "./settings/BehaviorsSettings";

interface ReaderSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: ReaderConfig;
    setConfig: (config: ReaderConfig) => void;
}

type SettingsTab = 'layout' | 'fit' | 'keybinds' | 'behaviors';

export default function ReaderSettingsModal({ isOpen, onClose, config, setConfig }: ReaderSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('layout');

    if (!isOpen) return null;

    // Helper untuk update config utama
    const updateConfig = (key: keyof ReaderConfig, value: any) => {
        setConfig({ ...config, [key]: value });
    };

    // Helper khusus untuk nested object imageSizing
    const updateImageSizing = (key: string, value: boolean) => {
        setConfig({
            ...config,
            imageSizing: {
                ...config.imageSizing,
                [key]: value
            }
        });
    };

    const tabs = [
        { id: 'layout', label: 'Page Layout' },
        { id: 'fit', label: 'Image fit' },
        { id: 'keybinds', label: 'Keybinds' }, // Placeholder
        { id: 'behaviors', label: 'Behaviors' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Window */}
            <div className="relative bg-[#191A1C] w-[800px] h-[600px] rounded-lg shadow-2xl flex border border-[#32353B] overflow-hidden">
                
                {/* 1. Sidebar Kiri (Categories) */}
                <div className="w-[200px] bg-[#191A1C] border-r border-[#32353B] flex flex-col pt-6">
                    <h2 className="text-white text-lg font-bold px-6 mb-6">Reader Settings</h2>
                    <div className="flex flex-col gap-1 px-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`text-left px-4 py-2 text-sm font-medium rounded transition
                                    ${activeTab === tab.id ? 'bg-[#32353B] text-white' : 'text-gray-400 hover:text-white hover:bg-[#232529]'}
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Konten Kanan */}
                <div className="flex-1 flex flex-col bg-[#191A1C]">
                    {/* Header Kanan (Title & Close) */}
                    <div className="flex justify-between items-center p-6 pb-2">
                        <h3 className="text-white text-xl font-bold">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {activeTab === 'layout' && (
                            <PageLayoutSettings config={config} updateConfig={updateConfig} />
                        )}
                        {activeTab === 'fit' && (
                            <ImageFitSettings config={config} updateImageSizing={updateImageSizing} />
                        )}
                        {activeTab === 'behaviors' && (
                            <BehaviorsSettings config={config} updateConfig={updateConfig} />
                        )}
                        {activeTab === 'keybinds' && (
                            <div className="text-gray-500 italic">Keybinds settings coming soon...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}