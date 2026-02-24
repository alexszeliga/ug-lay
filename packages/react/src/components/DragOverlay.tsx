import React from 'react';
import { useLayout } from '../context';

export const DragOverlay: React.FC = () => {
  const { dragState } = useLayout();
  
  if (!dragState) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        left: dragState.clientX,
        top: dragState.clientY,
        width: '150px',
        height: '30px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '10px',
        transform: 'translate(-50%, -50%)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}
    >
      Dragging {dragState.id.substring(0, 8)}...
    </div>
  );
};
