import React, { useMemo, useState, useEffect } from 'react';
import { LayoutEngine, LocalStorageAdapter, LayoutState } from '@ug-layout/core';
import { LayoutProvider, UGLayout } from '@ug-layout/react';

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

const CustomTile = ({ node }: any) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {node.contentId === 'analytics' && <Analytics />}
      {node.contentId === 'chat' && <Chat />}
      {!node.contentId && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed #444', color: '#666' }}>
          Empty React Tile
        </div>
      )}
    </div>
  );
};

const registry = {
  'analytics': CustomTile,
  'chat': CustomTile,
};

const CUSTOM_ICONS = {
  splitH: <span style={{ fontSize: '10px' }}>[H]</span>,
  splitV: <span style={{ fontSize: '10px' }}>[V]</span>,
  remove: <span style={{ fontSize: '10px', fontWeight: 'bold' }}>[X]</span>,
  maximize: <span style={{ fontSize: '10px' }}>[M]</span>,
  reset: <span style={{ fontSize: '10px' }}>[R]</span>,
};

const storage = new LocalStorageAdapter('react-demo');

export const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialState, setInitialState] = useState<LayoutState | undefined>(undefined);

  useEffect(() => {
    storage.load().then((state) => {
      if (state) setInitialState(state);
      setIsLoaded(true);
    });
  }, []);

  const engine = useMemo(() => {
    if (!isLoaded) return null;
    return new LayoutEngine(initialState, {
      persistence: storage
    });
  }, [isLoaded, initialState]);

  if (!isLoaded || !engine) {
    return <div style={{ background: '#1e1e1e', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Layout...</div>;
  }

  return (
    <LayoutProvider 
      engine={engine} 
      registry={registry}
      config={{ icons: CUSTOM_ICONS }}
    >
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
