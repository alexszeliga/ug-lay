import React, { useRef, useEffect, useState } from 'react';
import { Direction, calculateRatio } from '@ug-layout/core';
import { useLayout } from '../context';

export interface GutterProps {
  splitId: string;
  direction: Direction;
}

export const Gutter: React.FC<GutterProps> = ({ splitId, direction }) => {
  const { engine } = useLayout();
  const [isResizing, setIsResizing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parentRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (parentRectRef.current) {
        const newRatio = calculateRatio(parentRectRef.current, moveEvent.clientX, moveEvent.clientY, direction, engine.gutterSize);
        engine.setRatio(splitId, newRatio);
      }
    };

    const onPointerUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isResizing, engine, splitId, direction]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary pointer button (usually left click or touch)
    if (e.button !== 0) return;
    
    e.preventDefault();
    const parent = ref.current?.parentElement;
    if (!parent) return;

    parentRectRef.current = parent.getBoundingClientRect();
    setIsResizing(true);
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
  };

  return (
    <div 
      ref={ref} 
      className="ug-gutter" 
      style={{ 
        backgroundColor: 'var(--ug-gutter-bg, #444)', 
        cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize', 
        zIndex: 10,
        touchAction: 'none' // CRITICAL: Prevents browser scrolling during touch drag
      }} 
      onPointerDown={handlePointerDown} 
      onMouseDown={(e) => handlePointerDown(e as any)}
    />
  );
};
