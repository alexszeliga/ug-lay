import React, { useState } from 'react';
import { TileNode } from '@ug-layout/core';
import { useLayout } from '../context';
import { ICON_MAXIMIZE, ICON_SPLIT_H, ICON_SPLIT_V, ICON_REMOVE, ICON_RESET } from '../icons';
import { ControlButton } from './ControlButton';
import { DefaultPicker } from './DefaultPicker';

export interface TileComponentProps {
  node: TileNode;
}

export const TileComponent: React.FC<TileComponentProps> = ({ node }) => {
  const { registry, engine, setDraggedId, draggedId, config } = useLayout();
  const [isOver, setIsOver] = useState(false);
  const Component = node.contentId && registry ? registry[node.contentId] : null;

  const icons = {
    maximize: config?.icons?.maximize || ICON_MAXIMIZE,
    splitH: config?.icons?.splitH || ICON_SPLIT_H,
    splitV: config?.icons?.splitV || ICON_SPLIT_V,
    remove: config?.icons?.remove || ICON_REMOVE,
    reset: config?.icons?.reset || ICON_RESET,
  };

  const onDragStart = (e: React.DragEvent) => {
    setDraggedId(node.id);
    e.dataTransfer.setData('text/plain', node.id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId && draggedId !== node.id) setIsOver(true);
  };

  const onDragLeave = () => setIsOver(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (draggedId && draggedId !== node.id) {
      engine.swapTiles(draggedId, node.id);
    }
    setDraggedId(null);
  };

  const borderStyle = isOver ? 'var(--ug-tile-border-dragover, 2px solid #ffcc00)' : 'var(--ug-tile-border, 1px solid #444)';

  return (
    <div 
      className="ug-tile" 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ 
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
        boxSizing: 'border-box', border: borderStyle, overflow: 'hidden',
        backgroundColor: 'var(--ug-tile-bg, #2a2a2a)'
      }}
    >
      <div 
        className="ug-tile-header" 
        draggable 
        onDragStart={onDragStart}
        style={{ 
          background: 'var(--ug-header-bg, #333)', padding: '4px 8px', cursor: 'grab', fontSize: '11px', 
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
          borderBottom: 'var(--ug-header-border-bottom, 1px solid #444)', color: 'var(--ug-header-text, #888)'
        }}
      >
        <span style={{ opacity: 0.5 }}>{node.id.substring(0, 8)}</span>
        <span style={{ fontWeight: 'bold', color: 'var(--ug-header-title, #ccc)', textAlign: 'center' }}>{node.contentId || ''}</span>
        <div className="ug-controls" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <ControlButton onClick={() => engine.resetTile(node.id)} title="Reset">{icons.reset}</ControlButton>
          <ControlButton onClick={() => engine.maximizeTile(node.id)} title="Maximize">{icons.maximize}</ControlButton>
          <ControlButton onClick={() => engine.split(node.id, 'horizontal')} title="Split Horizontal">{icons.splitH}</ControlButton>
          <ControlButton onClick={() => engine.split(node.id, 'vertical')} title="Split Vertical">{icons.splitV}</ControlButton>
          <ControlButton onClick={() => engine.removeTile(node.id)} title="Remove" color="#ff4d4d">{icons.remove}</ControlButton>
        </div>
      </div>
      <div className="ug-tile-content" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Component ? <Component node={node} /> : <DefaultPicker tileId={node.id} />}
      </div>
    </div>
  );
};
