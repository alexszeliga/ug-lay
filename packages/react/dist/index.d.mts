import React from 'react';
import { LayoutEngine, LayoutState } from '@ug-layout/core';

interface LayoutConfig {
    icons?: {
        splitH?: React.ReactNode;
        splitV?: React.ReactNode;
        remove?: React.ReactNode;
        maximize?: React.ReactNode;
    };
}
interface LayoutContextValue {
    engine: LayoutEngine;
    state: LayoutState;
    registry?: Record<string, React.ComponentType<any>>;
    config?: LayoutConfig;
    draggedId: string | null;
    setDraggedId: (id: string | null) => void;
}
interface LayoutProviderProps {
    engine: LayoutEngine;
    registry?: Record<string, React.ComponentType<any>>;
    config?: LayoutConfig;
    children: React.ReactNode;
}
declare const LayoutProvider: React.FC<LayoutProviderProps>;
declare const useLayout: () => LayoutContextValue;

declare const UGLayout: React.FC;

export { type LayoutConfig, type LayoutContextValue, LayoutProvider, type LayoutProviderProps, UGLayout, useLayout };
