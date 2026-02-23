import React, { createContext, useContext, useMemo, useSyncExternalStore, useRef, useCallback, useState } from 'react';
import { LayoutEngine, LayoutState, LayoutNode, TileNode, SplitNode, Direction } from '@ug-layout/core';

interface LayoutContextValue {
  engine: LayoutEngine;
  state: LayoutState;
  registry?: Record<string, React.ComponentType<any>>;
  draggedId: string | null;
  setDraggedId: (id: string | null) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export interface LayoutProviderProps {
  engine: LayoutEngine;
  registry?: Record<string, React.ComponentType<any>>;
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ engine, registry, children }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const state = useSyncExternalStore(
    (callback) => engine.subscribe(callback),
    () => engine.getState()
  );

  const value = useMemo(() => ({ 
    engine, state, registry, draggedId, setDraggedId 
  }), [engine, state, registry, draggedId]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextValue => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// --- Internal Components ---

const ICON_SPLIT_H = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>;
const ICON_SPLIT_V = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(90deg)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>;
const ICON_REMOVE = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const ICON_MAXIMIZE = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>;

const ControlButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; color?: string }> = ({ onClick, title, children, color }) => (
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

const DefaultPicker: React.FC<{ tileId: string }> = ({ tileId }) => {
  const { engine, registry } = useLayout();
  if (!registry) return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Select a Component (No Registry)</div>;
  return (
    <div className="ug-picker" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px' }}>
      <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '4px', fontSize: '12px' }}>Select a Component</div>
      {Object.keys(registry).map((id) => (
        <button key={id} onClick={() => engine.updateTile(tileId, { contentId: id })} style={{ padding: '8px', cursor: 'pointer', background: '#444', color: 'white', border: '1px solid #555', borderRadius: '4px' }}>{id}</button>
      ))}
    </div>
  );
};

const Gutter: React.FC<{ splitId: string; direction: Direction }> = ({ splitId, direction }) => {
  const { engine } = useLayout();
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const gutterSize = 4;
    const onMouseMove = (moveEvent: MouseEvent) => {
      let r = direction === 'horizontal' 
        ? (moveEvent.clientX - rect.left - gutterSize / 2) / (rect.width - gutterSize)
        : (moveEvent.clientY - rect.top - gutterSize / 2) / (rect.height - gutterSize);
      engine.setRatio(splitId, r);
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

  return <div ref={ref} className="ug-gutter" style={{ backgroundColor: '#444', cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize', zIndex: 10 }} onMouseDown={handleMouseDown} />;
};

const TileComponent: React.FC<{ node: TileNode }> = ({ node }) => {
  const { registry, engine, setDraggedId, draggedId, state } = useLayout();
  const [isOver, setIsOver] = useState(false);
  const Component = node.contentId && registry ? registry[node.contentId] : null;

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

  const isFocused = state.root.id === node.id || node.id === 'FIXME_FOCUS'; // Focus logic to be refined
  const borderStyle = isOver ? '2px solid #ffcc00' : '1px solid #444';

  return (
    <div 
      className="ug-tile" 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ 
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
        boxSizing: 'border-box', border: borderStyle, overflow: 'hidden',
        backgroundColor: '#2a2a2a'
      }}
    >
      <div 
        className="ug-tile-header" 
        draggable 
        onDragStart={onDragStart}
        style={{ 
          background: '#333', padding: '4px 8px', cursor: 'grab', fontSize: '11px', 
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
          borderBottom: '1px solid #444', color: '#888'
        }}
      >
        <span style={{ opacity: 0.5 }}>{node.id.substring(0, 8)}</span>
        <span style={{ fontWeight: 'bold', color: '#ccc', textAlign: 'center' }}>{node.contentId || ''}</span>
        <div className="ug-controls" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <ControlButton onClick={() => engine.maximizeTile(node.id)} title="Maximize">{ICON_MAXIMIZE}</ControlButton>
          <ControlButton onClick={() => engine.split(node.id, 'horizontal')} title="Split Horizontal">{ICON_SPLIT_H}</ControlButton>
          <ControlButton onClick={() => engine.split(node.id, 'vertical')} title="Split Vertical">{ICON_SPLIT_V}</ControlButton>
          <ControlButton onClick={() => engine.removeTile(node.id)} title="Remove" color="#ff4d4d">{ICON_REMOVE}</ControlButton>
        </div>
      </div>
      <div className="ug-tile-content" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Component ? <Component node={node} /> : <DefaultPicker tileId={node.id} />}
      </div>
    </div>
  );
};

const LayoutNodeComponent: React.FC<{ node: LayoutNode }> = ({ node }) => {
  return node.type === 'tile' ? <TileComponent node={node} /> : <SplitComponent node={node} />;
};

const SplitComponent: React.FC<{ node: SplitNode }> = ({ node }) => {
  const r = node.ratio;
  const gutterSize = 4;
  const style: React.CSSProperties = {
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateColumns: node.direction === 'horizontal' ? `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr` : '100%',
    gridTemplateRows: node.direction === 'vertical' ? `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr` : '100%',
  };

  return (
    <div className="ug-split" style={style}>
      <LayoutNodeComponent node={node.children[0]} />
      <Gutter splitId={node.id} direction={node.direction} />
      <LayoutNodeComponent node={node.children[1]} />
    </div>
  );
};

export const UGLayout: React.FC = () => {
  const { state } = useLayout();
  return (
    <div className="ug-layout-root" style={{ width: '100%', height: '100%' }}>
      <LayoutNodeComponent node={state.root} />
    </div>
  );
};
