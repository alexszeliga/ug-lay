import React, { createContext, useContext, useMemo, useSyncExternalStore, useState } from 'react';
import { LayoutEngine, LayoutState } from '@ug-layout/core';

export interface LayoutConfig {
  icons?: {
    splitH?: React.ReactNode;
    splitV?: React.ReactNode;
    remove?: React.ReactNode;
    maximize?: React.ReactNode;
    reset?: React.ReactNode;
  };
}

export interface LayoutContextValue {
  engine: LayoutEngine;
  state: LayoutState;
  registry?: Record<string, React.ComponentType<any>>;
  config?: LayoutConfig;
  draggedId: string | null;
  setDraggedId: (id: string | null) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export interface LayoutProviderProps {
  engine: LayoutEngine;
  registry?: Record<string, React.ComponentType<any>>;
  config?: LayoutConfig;
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ engine, registry, config, children }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const state = useSyncExternalStore(
    (callback) => engine.subscribe(callback),
    () => engine.getState()
  );

  const value = useMemo(() => ({ 
    engine, state, registry, config, draggedId, setDraggedId 
  }), [engine, state, registry, config, draggedId]);

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
