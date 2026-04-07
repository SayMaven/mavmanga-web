// src/types/readerTypes.ts

export type ReadingDirection = 'ltr' | 'rtl';
export type PageStyle = 'single' | 'double' | 'long-strip' | 'wide-strip';
export type ProgressBarType = 'hidden' | 'normal';
export type CursorHint = 'none' | 'overlay' | 'cursor';
export type ScrollPageType = 'disabled' | 'wheel' | 'keyboard' | 'both';
export interface ReaderConfig {
    pageStyle: PageStyle;
    readingDirection: ReadingDirection;
    headerVisible: boolean;
    progressBarStyle: ProgressBarType;
    cursorHint: CursorHint;
    fitMode: 'height' | 'width' | 'original'; 
    imageSizing: {
        containWidth: boolean;
        containHeight: boolean;
        stretchSmall: boolean;
        maxWidth: boolean;
        maxHeight: boolean;
    };

    turnPageByScroll: ScrollPageType;
    doubleClickFullscreen: boolean;
}