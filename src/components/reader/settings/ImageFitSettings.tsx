//src/components/reader/settings/ImageFitSettings.tsx
'use client';
import { ReaderConfig } from "@/types/readerTypes";

interface ImageFitSettingsProps {
    config: ReaderConfig;
    updateImageSizing: (key: string, value: boolean) => void;
}

export default function ImageFitSettings({ config, updateImageSizing }: ImageFitSettingsProps) {
    
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-gray-300 text-sm font-medium">Image Sizing</label>
                
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={config.imageSizing.containWidth} 
                            onChange={(e) => updateImageSizing('containWidth', e.target.checked)}
                            className="w-5 h-5 bg-transparent border-2 border-gray-500 rounded text-[#FF6740] focus:ring-0 checked:bg-[#FF6740] checked:border-transparent transition" 
                        />
                        <span className="text-gray-300 text-sm group-hover:text-white transition">Contain to width</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={config.imageSizing.containHeight} 
                            onChange={(e) => updateImageSizing('containHeight', e.target.checked)}
                            className="w-5 h-5 bg-transparent border-2 border-gray-500 rounded text-[#FF6740] focus:ring-0 checked:bg-[#FF6740] checked:border-transparent transition" 
                        />
                        <span className="text-gray-300 text-sm group-hover:text-white transition">Contain to height</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={config.imageSizing.stretchSmall} 
                            onChange={(e) => updateImageSizing('stretchSmall', e.target.checked)}
                            className="w-5 h-5 bg-transparent border-2 border-gray-500 rounded text-[#FF6740] focus:ring-0 checked:bg-[#FF6740] checked:border-transparent transition" 
                        />
                        <span className="text-gray-300 text-sm group-hover:text-white transition">Stretch small pages</span>
                    </label>
                </div>

                
            </div>
        </div>
    );
}