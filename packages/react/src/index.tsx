import React from 'react';
import { useLayout } from './context';
import { LayoutNodeComponent } from './components/LayoutNode';
import { MaximizedOverlay } from './components/MaximizedOverlay';
import { findTile } from './utils';

export * from './context';

export const UGLayout: React.FC = () => {
  const { state } = useLayout();
  const maximizedNode = state.maximizedTileId ? findTile(state.root, state.maximizedTileId) : null;

  return (
    <div className="ug-layout-root" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <LayoutNodeComponent node={state.root} />
      {maximizedNode && <MaximizedOverlay node={maximizedNode} />}
    </div>
  );
};
