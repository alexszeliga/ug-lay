import React, { useMemo } from 'react';
import { LayoutEngine } from '@ug-layout/core';
import { LayoutProvider, UGLayout, useLayout } from '@ug-layout/react';

const Analytics = () => (
  <div style={{ padding: '20px', background: '#ff4d4d22', border: '1px solid #ff4d4d', height: '100%', boxSizing: 'border-box' }}>
    <h3>Analytics Widget</h3>
    <p>Live data streaming...</p>
  </div>
);

const Chat = () => (
  <div style={{ padding: '20px', background: '#4d4dff22', border: '1px solid #4d4dff', height: '100%', boxSizing: 'border-box' }}>
    <h3>Chat Room</h3>
    <p>User joined the session.</p>
  </div>
);

const TileControls = ({ nodeId }: { nodeId: string }) => {
  const { engine } = useLayout();
  return (
    <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 5 }}>
      <button onClick={() => engine.split(nodeId, 'horizontal')}>H</button>
      <button onClick={() => engine.split(nodeId, 'vertical')}>V</button>
      <button onClick={() => engine.removeTile(nodeId)} style={{ color: 'red' }}>X</button>
    </div>
  );
};

const CustomTile = ({ node }: any) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <TileControls nodeId={node.id} />
      {node.contentId === 'analytics' && <Analytics />}
      {node.contentId === 'chat' && <Chat />}
      {!node.contentId && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed #444' }}>
          Empty React Tile
        </div>
      )}
    </div>
  );
};

// We wrap the TileComponent to inject our controls
const registry = {
  'analytics': CustomTile,
  'chat': CustomTile,
  'empty': CustomTile
};

export const App = () => {
  const engine = useMemo(() => {
    const e = new LayoutEngine();
    const rootId = e.getState().root.id;
    e.split(rootId, 'horizontal');
    const leftId = (e.getState().root as any).children[0].id;
    e.updateTile(leftId, { contentId: 'analytics' });
    return e;
  }, []);

  return (
    <LayoutProvider engine={engine} registry={registry}>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '10px 20px', background: '#333', borderBottom: '1px solid #444' }}>
          <strong>ug-layout / react-sandbox</strong>
        </header>
        <main style={{ flex: 1 }}>
          <UGLayout />
        </main>
      </div>
    </LayoutProvider>
  );
};
