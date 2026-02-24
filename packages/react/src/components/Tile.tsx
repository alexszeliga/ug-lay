import React, { useState, useRef, useEffect } from 'react';
import { TileNode, getDropAction, DropAction } from '@ug-layout/core';
import { useLayout } from '../context';
import { ICON_MAXIMIZE, ICON_SPLIT_H, ICON_SPLIT_V, ICON_REMOVE, ICON_RESET, ICON_ADD } from '../icons';
import { ControlButton } from './ControlButton';
import { DefaultPicker } from './DefaultPicker';
import { useDragCoordinator } from '../hooks/useDragCoordinator';

export interface TileComponentProps<TMetadata = any> {
  node: TileNode<TMetadata>;
  tabId?: string;
}

const GhostPreview: React.FC<{ action: DropAction }> = ({ action }) => {
// ... existing GhostPreview implementation (no changes needed)
  const style: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'var(--ug-ghost-bg, rgba(255, 204, 0, 0.3))',
    border: 'var(--ug-ghost-border, 2px solid #ffcc00)',
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
  const { registry, engine, dragState, setDragState, config } = useLayout<TMetadata>();
  const [showPicker, setShowPicker] = useState(false);
  const [preDragInfo, setPreDragInfo] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { startDrag } = useDragCoordinator({ engine, dragState, setDragState });

  useEffect(() => {
    if (!preDragInfo) return;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(moveEvent.clientX - preDragInfo.x, moveEvent.clientY - preDragInfo.y);
      if (dist > engine.dragThreshold) {
        setPreDragInfo(null);
        startDrag(node.id, moveEvent.clientX, moveEvent.clientY);
      }
    };

    const onPointerUp = () => setPreDragInfo(null);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [preDragInfo, node.id, startDrag]);

  const hasTabs = node.tabs && node.tabs.length > 0;
  const activeTabIndex = node.activeTabIndex ?? 0;
  const activeTab = hasTabs ? node.tabs![activeTabIndex] : null;
  
  const contentId = activeTab ? activeTab.contentId : node.contentId;
  const Component = contentId && registry ? (registry[contentId] as React.ComponentType<TileComponentProps<TMetadata>>) : null;

  const icons = {
    maximize: config?.icons?.maximize || ICON_MAXIMIZE,
    splitH: config?.icons?.splitH || ICON_SPLIT_H,
    splitV: config?.icons?.splitV || ICON_SPLIT_V,
    remove: config?.icons?.remove || ICON_REMOVE,
    reset: config?.icons?.reset || ICON_RESET,
    add: config?.icons?.add || ICON_ADD,
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Only handle primary pointer button
    if (e.button !== 0) return;
    
    // Don't start drag if clicking controls or tabs (though tabs might be draggable later)
    if ((e.target as HTMLElement).closest('.ug-controls')) return;

    setPreDragInfo({ x: e.clientX, y: e.clientY });
  };

  const isTarget = dragState?.targetId === node.id;

  return (
    <div 
      ref={containerRef}
      className="ug-tile" 
      data-tile-id={node.id}
      style={{ 
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
        boxSizing: 'border-box', border: 'var(--ug-tile-border, 1px solid #444)', overflow: 'hidden',
        backgroundColor: 'var(--ug-tile-bg, #2a2a2a)',
        position: 'relative',
        opacity: dragState?.id === node.id ? 0.5 : 1
      }}
    >
      {isTarget && dragState?.dropAction && <GhostPreview action={dragState.dropAction} />}
      <div 
        className="ug-tile-header" 
        onPointerDown={onPointerDown}
        onMouseDown={(e) => onPointerDown(e as any)}
        style={{ 
          background: 'var(--ug-header-bg, #333)', padding: '4px 8px', cursor: 'grab', fontSize: '11px', 
          display: 'grid', gridTemplateColumns: '80px 1fr 80px', alignItems: 'center',
          borderBottom: 'var(--ug-header-border-bottom, 1px solid #444)', color: 'var(--ug-header-text, #888)',
          userSelect: 'none',
          touchAction: 'none' // Crucial for touch dragging
        }}
      >
        <span style={{ opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.id.substring(0, 8)}</span>
        
        {/* Tab Bar or Title */}
        <div style={{ display: 'flex', gap: '4px', overflow: 'hidden', height: '100%', alignItems: 'center', padding: '0 8px' }}>
          {hasTabs ? (
            node.tabs!.map((tab, idx) => (
              <div 
                key={tab.id}
                onClick={(e) => { e.stopPropagation(); engine.selectTab(node.id, idx); }}
                style={{
                  padding: '2px 8px',
                  borderRadius: '3px 3px 0 0',
                  background: idx === activeTabIndex ? 'var(--ug-active-tab-bg, #2a2a2a)' : 'transparent',
                  color: idx === activeTabIndex ? 'var(--ug-header-title, #ccc)' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: idx === activeTabIndex ? '1px solid var(--ug-header-border-bottom, #444)' : '1px solid transparent',
                  borderBottom: 'none',
                }}
              >
                {tab.contentId}
                <span 
                  onClick={(e) => { e.stopPropagation(); engine.removeTab(node.id, tab.id); }}
                  style={{ opacity: 0.5, fontSize: '12px' }}
                >
                  ×
                </span>
              </div>
            ))
          ) : (
            <span style={{ fontWeight: 'bold', color: 'var(--ug-header-title, #ccc)', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.contentId || ''}
            </span>
          )}
        </div>

        <div className="ug-controls" style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
          <ControlButton onClick={() => setShowPicker(!showPicker)} title="Add Tab">{icons.add}</ControlButton>
          <ControlButton onClick={() => engine.resetTile(node.id)} title="Reset">{icons.reset}</ControlButton>
          <ControlButton onClick={() => engine.maximizeTile(node.id)} title="Maximize">{icons.maximize}</ControlButton>
          <ControlButton onClick={() => engine.split(node.id, 'horizontal')} title="Split Horizontal">{icons.splitH}</ControlButton>
          <ControlButton onClick={() => engine.split(node.id, 'vertical')} title="Split Vertical">{icons.splitV}</ControlButton>
          <ControlButton onClick={() => engine.removeTile(node.id)} title="Remove" color="var(--ug-control-danger, #ff4d4d)">{icons.remove}</ControlButton>
        </div>
      </div>
      <div className="ug-tile-content" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showPicker || (!Component && !hasTabs) ? (
          <DefaultPicker 
            tileId={node.id} 
            onSelect={() => setShowPicker(false)} 
            asTab={hasTabs || !!node.contentId} 
          />
        ) : (
          Component && <Component node={node} tabId={activeTab?.id} />
        )}
      </div>
    </div>
  );
}
