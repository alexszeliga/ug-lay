import React, { useState, useRef } from 'react';
import { TileNode, getDropAction, DropAction } from '@ug-layout/core';
import { useLayout } from '../context';
import { ICON_MAXIMIZE, ICON_SPLIT_H, ICON_SPLIT_V, ICON_REMOVE, ICON_RESET } from '../icons';
import { ControlButton } from './ControlButton';
import { DefaultPicker } from './DefaultPicker';

export interface TileComponentProps<TMetadata = any> {
  node: TileNode<TMetadata>;
}

const GhostPreview: React.FC<{ action: DropAction }> = ({ action }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'rgba(255, 204, 0, 0.3)',
    border: '2px solid #ffcc00',
    pointerEvents: 'none',
    zIndex: 100,
    transition: 'all 0.1s ease-out',
  };

  if (action.type === 'swap') {
    style.top = '10%';
    style.left = '10%';
    style.width = '80%';
    style.height = '80%';
  } else {
    if (action.direction === 'horizontal') {
      style.width = '50%';
      style.height = '100%';
      style.top = 0;
      style.left = action.side === 'before' ? 0 : '50%';
    } else {
      style.width = '100%';
      style.height = '50%';
      style.left = 0;
      style.top = action.side === 'before' ? 0 : '50%';
    }
  }

  return <div className="ug-ghost-preview" style={style} />;
};

export function TileComponent<TMetadata = any>({ node }: TileComponentProps<TMetadata>) {
  const { registry, engine, setDraggedId, draggedId, config } = useLayout<TMetadata>();
  const [dropAction, setDropAction] = useState<DropAction | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const Component = node.contentId && registry ? (registry[node.contentId] as React.ComponentType<TileComponentProps<TMetadata>>) : null;

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
    if (!draggedId || draggedId === node.id || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const action = getDropAction(rect, e.clientX, e.clientY);
    setDropAction(action);
  };

  const onDragLeave = () => setDropAction(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const action = dropAction;
    setDropAction(null);

    if (draggedId && draggedId !== node.id && action) {
      if (action.type === 'swap') {
        engine.swapTiles(draggedId, node.id);
      } else {
        // Edge snapping logic goes here in the NEXT step.
        // For now, we still just swap to verify the visual.
        engine.swapTiles(draggedId, node.id);
      }
    }
    setDraggedId(null);
  };

  return (
    <div 
      ref={containerRef}
      className="ug-tile" 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ 
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
        boxSizing: 'border-box', border: 'var(--ug-tile-border, 1px solid #444)', overflow: 'hidden',
        backgroundColor: 'var(--ug-tile-bg, #2a2a2a)',
        position: 'relative'
      }}
    >
      {dropAction && <GhostPreview action={dropAction} />}
      <div 
        className="ug-tile-header" 
        draggable 
        onDragStart={onDragStart}
        style={{ 
          background: 'var(--ug-header-bg, #333)', padding: '4px 8px', cursor: 'grab', fontSize: '11px', 
          display: 'grid', gridTemplateColumns: '80px 1fr 80px', alignItems: 'center',
          borderBottom: 'var(--ug-header-border-bottom, 1px solid #444)', color: 'var(--ug-header-text, #888)'
        }}
      >
        <span style={{ opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.id.substring(0, 8)}</span>
        <span style={{ fontWeight: 'bold', color: 'var(--ug-header-title, #ccc)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.contentId || ''}</span>
        <div className="ug-controls" style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
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
}
