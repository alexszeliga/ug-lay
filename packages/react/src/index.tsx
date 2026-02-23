import React from 'react';
import { useLayout } from './context';
import { LayoutNodeComponent } from './components/LayoutNode';
import { MaximizedOverlay } from './components/MaximizedOverlay';
import { findTile } from './utils';

export * from './context';

export function UGLayout<TMetadata = any>() {
  const { state } = useLayout<TMetadata>();
  const maximizedNode = state.maximizedTileId ? findTile(state.root, state.maximizedTileId) : null;

  return (
    <div className="ug-layout-root" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <LayoutNodeComponent node={state.root} />
      {maximizedNode && <MaximizedOverlay node={maximizedNode} />}
    </div>
  );
}
