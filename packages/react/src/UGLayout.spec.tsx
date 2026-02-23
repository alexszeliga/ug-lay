import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutProvider, UGLayout } from './index';
import { LayoutEngine } from '../../core/src/index';

describe('UGLayout', () => {
  it('should render a split layout', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    engine.split(rootId, 'horizontal');

    render(
      <LayoutProvider engine={engine}>
        <UGLayout />
      </LayoutProvider>
    );

    const pickers = screen.getAllByText(/Select a Component/i);
    expect(pickers).toHaveLength(2);

    const gutter = document.querySelector('.ug-gutter');
    expect(gutter).toBeDefined();
  });

  it('should render a picker when a tile is empty', () => {
    const engine = new LayoutEngine();
    render(
      <LayoutProvider engine={engine}>
        <UGLayout />
      </LayoutProvider>
    );
    expect(screen.getByText(/Select a Component/i)).toBeInTheDocument();
  });

  it('should trigger a swap when dragging one tile onto another', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    engine.split(rootId, 'horizontal');
    
    const state = engine.getState().root as any;
    const idA = state.children[0].id;
    const idB = state.children[1].id;

    const swapSpy = vi.spyOn(engine, 'swapTiles');

    render(
      <LayoutProvider engine={engine}>
        <UGLayout />
      </LayoutProvider>
    );

    const tiles = document.querySelectorAll('.ug-tile-header');
    const source = tiles[0];
    const target = tiles[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
    };

    // Use fireEvent which is better for React tests
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target);
    fireEvent.drop(target);

    expect(swapSpy).toHaveBeenCalledWith(idA, idB);
  });
});
