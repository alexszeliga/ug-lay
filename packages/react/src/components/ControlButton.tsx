import React from 'react';

export interface ControlButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  color?: string;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ onClick, title, children, color }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }} 
    title={title}
    style={{ border: 'none', background: 'none', color: color || 'inherit', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', opacity: 0.7 }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
  >
    {children}
  </button>
);
