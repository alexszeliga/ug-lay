import React, { useRef, useCallback } from 'react';
import { Direction } from '@ug-layout/core';
import { useLayout } from '../context';

export interface GutterProps {
  splitId: string;
  direction: Direction;
}

export const Gutter: React.FC<GutterProps> = ({ splitId, direction }) => {
  const { engine } = useLayout();
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle primary pointer button (usually left click or touch)
    if (e.button !== 0) return;
    
    e.preventDefault();
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const gutterSize = 4;

    const onPointerMove = (moveEvent: PointerEvent) => {
      let newRatio;
      if (direction === 'horizontal') {
        newRatio = (moveEvent.clientX - rect.left - gutterSize / 2) / (rect.width - gutterSize);
      } else {
        newRatio = (moveEvent.clientY - rect.top - gutterSize / 2) / (rect.height - gutterSize);
      }
      engine.setRatio(splitId, newRatio);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = '';
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
  }, [engine, splitId, direction]);

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
    />
  );
};
