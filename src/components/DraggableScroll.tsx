// src/components/DraggableScroll.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';

const DraggableScroll = memo(function DraggableScroll({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftAtStart = useRef(0);
  const rafId = useRef<number | null>(null);
  const hasMoved = useRef(false);

  // Passive scroll loop protection for touch/mouse up
  const items = React.Children.toArray(children);
  const shouldLoop = items.length > 5;

  // Center the loop to the middle copy on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !shouldLoop) return;
    el.scrollLeft = el.scrollWidth / 3;
  }, [shouldLoop]);

  // Infinite scroll snap on scroll event
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !shouldLoop) return;

    const onScroll = () => {
      if (isDown.current) return;
      const w = el.scrollWidth / 3;
      if (el.scrollLeft >= w * 2 - 20) el.scrollLeft -= w;
      else if (el.scrollLeft <= 20) el.scrollLeft += w;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [shouldLoop]);

  // Global mouse move — runs in RAF for GPU-friendliness
  const onGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.8;

    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
      if (!isDragging) setIsDragging(true);
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeftAtStart.current - walk;
      }
    });
  }, [isDragging]);

  const onGlobalMouseUp = useCallback(() => {
    isDown.current = false;
    if (rafId.current) cancelAnimationFrame(rafId.current);

    setTimeout(() => setIsDragging(false), 0);

    // Snap back to loop center if needed
    const el = scrollRef.current;
    if (el && shouldLoop) {
      const w = el.scrollWidth / 3;
      if (el.scrollLeft >= w * 2 - 20) el.scrollLeft -= w;
      else if (el.scrollLeft <= 20) el.scrollLeft += w;
    }
  }, [shouldLoop]);

  useEffect(() => {
    window.addEventListener('mousemove', onGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [onGlobalMouseMove, onGlobalMouseUp]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftAtStart.current = scrollRef.current.scrollLeft;
  };

  // Block click if user dragged
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={scrollRef}
      className={`
        flex overflow-x-auto pb-3 scrollbar-hide select-none
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${className}
      `}
      style={{
        // Promote scrolling to its own GPU layer
        willChange: 'scroll-position',
        // Prevent layout from triggering paint on scroll
        contain: 'layout style',
      }}
      onMouseDown={onMouseDown}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      {shouldLoop ? (
        <div className={`flex gap-4 ${isDragging ? 'pointer-events-none' : ''}`}>
          {items.map((child, i) => (
            <div key={`a-${i}`} className="flex-shrink-0" style={{ transform: 'translateZ(0)' }}>
              {child}
            </div>
          ))}
          {items.map((child, i) => (
            <div key={`b-${i}`} className="flex-shrink-0" style={{ transform: 'translateZ(0)' }}>
              {child}
            </div>
          ))}
          {items.map((child, i) => (
            <div key={`c-${i}`} className="flex-shrink-0" style={{ transform: 'translateZ(0)' }}>
              {child}
            </div>
          ))}
        </div>
      ) : (
        <div className={`flex gap-4 ${isDragging ? 'pointer-events-none' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
});

export default DraggableScroll;