// src/types/readerTypes.ts

export type ReadingDirection = 'ltr' | 'rtl';
export type PageStyle = 'single' | 'double' | 'long-strip' | 'wide-strip';
export type ProgressBarType = 'hidden' | 'normal';
// HAPUS ProgressBarPos
export type CursorHint = 'none' | 'overlay' | 'cursor';
export type ScrollPageType = 'disabled' | 'wheel' | 'keyboard' | 'both';

export interface ReaderConfig {
    // Page Layout
    pageStyle: PageStyle;
    readingDirection: ReadingDirection;
    headerVisible: boolean;
    progressBarStyle: ProgressBarType;
    // HAPUS progressBarPosition
    cursorHint: CursorHint;
    
    // Image Fit
    fitMode: 'height' | 'width' | 'original'; 
    imageSizing: {
        containWidth: boolean;
        containHeight: boolean;
        stretchSmall: boolean;
        maxWidth: boolean;
        maxHeight: boolean;
    };

    // Behaviors
    turnPageByScroll: ScrollPageType;
    doubleClickFullscreen: boolean;
}