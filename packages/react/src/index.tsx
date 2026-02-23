import React, { createContext, useContext, useMemo, useSyncExternalStore, useRef, useCallback } from 'react';
import { LayoutEngine, LayoutState, LayoutNode, TileNode, SplitNode, Direction } from '@ug-layout/core';

interface LayoutContextValue {
  engine: LayoutEngine;
  state: LayoutState;
  registry?: Record<string, React.ComponentType<any>>;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export interface LayoutProviderProps {
  engine: LayoutEngine;
  registry?: Record<string, React.ComponentType<any>>;
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ engine, registry, children }) => {
  const state = useSyncExternalStore(
    (callback) => engine.subscribe(callback),
    () => engine.getState()
  );

  const value = useMemo(() => ({ engine, state, registry }), [engine, state, registry]);

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

const DefaultPicker: React.FC<{ tileId: string }> = ({ tileId }) => {
  const { engine, registry } = useLayout();
  
  if (!registry) return <div>Select a Component (No Registry)</div>;

  return (
    <div className="ug-picker" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px' }}>
      <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '4px' }}>Select a Component</div>
      {Object.keys(registry).map((id) => (
        <button 
          key={id} 
          onClick={() => engine.updateTile(tileId, { contentId: id })}
          style={{ padding: '8px', cursor: 'pointer' }}
        >
          {id}
        </button>
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
      let newRatio;
      if (direction === 'horizontal') {
        newRatio = (moveEvent.clientX - rect.left - gutterSize / 2) / (rect.width - gutterSize);
      } else {
        newRatio = (moveEvent.clientY - rect.top - gutterSize / 2) / (rect.height - gutterSize);
      }
      engine.setRatio(splitId, newRatio);
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

  const style: React.CSSProperties = {
    backgroundColor: '#444',
    cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize',
    zIndex: 10,
  };

  return <div ref={ref} className="ug-gutter" style={style} onMouseDown={handleMouseDown} />;
};

const TileComponent: React.FC<{ node: TileNode }> = ({ node }) => {
  const { registry } = useLayout();
  const Component = node.contentId && registry ? registry[node.contentId] : null;

  return (
    <div className="ug-tile" data-tile-id={node.id} style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      {Component ? <Component node={node} /> : <DefaultPicker tileId={node.id} />}
    </div>
  );
};

const LayoutNodeComponent: React.FC<{ node: LayoutNode }> = ({ node }) => {
  if (node.type === 'tile') {
    return <TileComponent node={node} />;
  }
  return <SplitComponent node={node} />;
};

const SplitComponent: React.FC<{ node: SplitNode }> = ({ node }) => {
  const r = node.ratio;
  const gutterSize = 4;
  const style: React.CSSProperties = {
    display: 'grid',
    width: '100%',
    height: '100%',
  };

  if (node.direction === 'horizontal') {
    style.gridTemplateColumns = `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr`;
    style.gridTemplateRows = '100%';
  } else {
    style.gridTemplateRows = `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr`;
    style.gridTemplateColumns = '100%';
  }

  return (
    <div className="ug-split" data-split-id={node.id} style={style}>
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
