// src/components/DraggableScroll.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

export default function DraggableScroll({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode, 
  className?: string 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const items = React.Children.toArray(children);
  const shouldLoop = items.length > 5;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !shouldLoop) return;

    if (container.scrollLeft === 0) {
        const singleSetWidth = container.scrollWidth / 3;
        container.scrollLeft = singleSetWidth;
    }

    const handleScrollLogic = () => {
      if (isDown.current) return; 

      const singleSetWidth = container.scrollWidth / 3;
      if (container.scrollLeft >= singleSetWidth * 2 - 50) {
        container.scrollLeft = singleSetWidth + (container.scrollLeft - singleSetWidth * 2);
      } else if (container.scrollLeft <= 50) {
         container.scrollLeft = singleSetWidth + container.scrollLeft;
      }
    };

    container.addEventListener('scroll', handleScrollLogic);
    return () => container.removeEventListener('scroll', handleScrollLogic);
  }, [items.length, shouldLoop]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;

    if (Math.abs(walk) > 5) { 
        if (!isDragging) setIsDragging(true); 
        
        const targetScroll = scrollLeftState.current - walk;
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = targetScroll;
            }
        });
    }

  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    isDown.current = false;

    setTimeout(() => {
        setIsDragging(false);
    }, 0);

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    const container = scrollRef.current;
    if (container && shouldLoop) {
        const singleSetWidth = container.scrollWidth / 3;
        if (container.scrollLeft >= singleSetWidth * 2 - 50) {
            container.scrollLeft = singleSetWidth + (container.scrollLeft - singleSetWidth * 2);
        } else if (container.scrollLeft <= 50) {
            container.scrollLeft = singleSetWidth + container.scrollLeft;
        }
    }
  }, [shouldLoop]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [handleMouseMove, handleMouseUp]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftState.current = scrollRef.current.scrollLeft;
  };

  const onClickCapture = (e: React.MouseEvent) => {
      if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
      }
  };

  const onDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div
      ref={scrollRef}
      className={`
        flex overflow-x-auto pb-4 gap-4 px-4 md:px-0 scrollbar-hide select-none
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} 
        ${className}
      `}
      onMouseDown={onMouseDown}
      onClick={onClickCapture} 
      onDragStart={onDragStart} 
      style={{ willChange: 'scroll-position' }} 
    >
      {shouldLoop ? (
        <div className={`flex gap-4 ${isDragging ? 'pointer-events-none' : ''}`}>
             {items.map((child, i) => <div key={`clone-left-${i}`} className="flex-shrink-0">{child}</div>)}
             {items.map((child, i) => <div key={`main-${i}`} className="flex-shrink-0">{child}</div>)}
             {items.map((child, i) => <div key={`clone-right-${i}`} className="flex-shrink-0">{child}</div>)}
        </div>
      ) : (
        <div className={`flex gap-4 ${isDragging ? 'pointer-events-none' : ''}`}>
            {children}
        </div>
      )}
    </div>
  );
}