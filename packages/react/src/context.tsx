import React, { createContext, useContext, useMemo, useSyncExternalStore, useState } from 'react';
import { LayoutEngine, LayoutState, TileNode } from '@ug-layout/core';

export interface TileComponentProps<TMetadata = any> {
  node: TileNode<TMetadata>;
}

export type ComponentRegistry<TMetadata = any> = Record<string, React.ComponentType<TileComponentProps<TMetadata>>>;

export interface LayoutConfig {
  icons?: {
    splitH?: React.ReactNode;
    splitV?: React.ReactNode;
    remove?: React.ReactNode;
    maximize?: React.ReactNode;
    reset?: React.ReactNode;
  };
}

export interface LayoutContextValue<TMetadata = any> {
  engine: LayoutEngine<TMetadata>;
  state: LayoutState<TMetadata>;
  registry?: ComponentRegistry<TMetadata>;
  config?: LayoutConfig;
  draggedId: string | null;
  setDraggedId: (id: string | null) => void;
}

const LayoutContext = createContext<LayoutContextValue<any> | null>(null);

export interface LayoutProviderProps<TMetadata = any> {
  engine: LayoutEngine<TMetadata>;
  registry?: ComponentRegistry<TMetadata>;
  config?: LayoutConfig;
  children: React.ReactNode;
}

export function LayoutProvider<TMetadata = any>({ 
  engine, 
  registry, 
  config, 
  children 
}: LayoutProviderProps<TMetadata>) {
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
}

export const useLayout = <TMetadata = any>(): LayoutContextValue<TMetadata> => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context as LayoutContextValue<TMetadata>;
};
