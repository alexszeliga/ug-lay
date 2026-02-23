import React from 'react';
import { TileNode } from '@ug-layout/core';
import { useLayout } from '../context';
import { ICON_REMOVE } from '../icons';
import { ControlButton } from './ControlButton';
import { DefaultPicker } from './DefaultPicker';

export interface MaximizedOverlayProps {
  node: TileNode;
}

export const MaximizedOverlay: React.FC<MaximizedOverlayProps> = ({ node }) => {
  const { engine, registry } = useLayout();
  const Component = node.contentId && registry ? registry[node.contentId] : null;

  return (
    <div 
      className="ug-maximized-overlay" 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        background: 'var(--ug-overlay-bg, rgba(0,0,0,0.9))', zIndex: 1000, display: 'flex', flexDirection: 'column' 
      }}
    >
      <div 
        style={{ 
          background: 'var(--ug-overlay-header-bg, #007acc)', padding: '10px 20px', display: 'flex', 
          justifyContent: 'space-between', alignSelf: 'stretch', alignItems: 'center' 
        }}
      >
        <strong style={{ color: 'white' }}>Maximized View {node.contentId ? `- ${node.contentId}` : ''}</strong>
        <ControlButton onClick={() => engine.minimize()} title="Close Maximized View">
          {ICON_REMOVE}
        </ControlButton>
      </div>
      <div style={{ flex: 1, padding: '40px' }}>
        {Component ? <Component node={node} /> : <DefaultPicker tileId={node.id} />}
      </div>
    </div>
  );
};
