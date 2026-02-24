import React from 'react';
import { useLayout } from './context';
import { LayoutNodeComponent } from './components/LayoutNode';
import { MaximizedOverlay } from './components/MaximizedOverlay';
import { DragOverlay } from './components/DragOverlay';
import { findTile } from './utils';

export * from './context';

export function UGLayout<TMetadata = any>() {
  const { state } = useLayout<TMetadata>();
  const maximizedNode = state.maximizedTileId ? findTile(state.root, state.maximizedTileId) : null;

  const defaultThemeVars: React.CSSProperties = {
    '--ug-tile-bg': '#2a2a2a',
    '--ug-tile-border': '1px solid #444',
    '--ug-header-bg': '#333',
    '--ug-header-text': '#888',
    '--ug-header-title': '#ccc',
    '--ug-header-border-bottom': '1px solid #444',
    '--ug-gutter-bg': '#444',
    '--ug-active-tab-bg': '#2a2a2a',
    '--ug-ghost-bg': 'rgba(255, 204, 0, 0.3)',
    '--ug-ghost-border': '2px solid #ffcc00',
    '--ug-control-hover-bg': 'rgba(255, 255, 255, 0.1)',
    '--ug-control-danger': '#ff4d4d',
  } as React.CSSProperties;

  return (
    <div 
      className="ug-layout-root" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        ...defaultThemeVars
      }}
    >
      <LayoutNodeComponent node={state.root} />
      {maximizedNode && <MaximizedOverlay node={maximizedNode} />}
      <DragOverlay />
    </div>
  );
}
