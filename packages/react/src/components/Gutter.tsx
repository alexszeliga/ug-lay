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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const gutterSize = 4;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newRatio;
      if (direction === 'horizontal') {
        newRatio = (moveEvent.clientX - rect.left - gutterSize / 2) / (rect.width - gutterSize);
      } else {
        newRatio = (moveEvent.clientY - rect.top - gutterSize / 2) / (rect.height - gutterSize);
      }
      engine.setRatio(splitId, newRatio);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
  }, [engine, splitId, direction]);

  return (
    <div 
      ref={ref} 
      className="ug-gutter" 
      style={{ 
        backgroundColor: 'var(--ug-gutter-bg, #444)', 
        cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize', 
        zIndex: 10 
      }} 
      onMouseDown={handleMouseDown} 
    />
  );
};
