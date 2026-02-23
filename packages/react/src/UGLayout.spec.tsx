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

  it('should have a header with three sections: ID, Title, and Controls', () => {
    const engine = new LayoutEngine();
    engine.updateTile(engine.getState().root.id, { contentId: 'test-widget' });
    
    // We pass a registry so we can check for the title
    const registry = { 'test-widget': () => <div>Widget</div> };

    render(
      <LayoutProvider engine={engine} registry={registry}>
        <UGLayout />
      </LayoutProvider>
    );

    const header = document.querySelector('.ug-tile-header');
    expect(header).toBeDefined();
    
    // Check for 3 sections
    expect(header?.children).toHaveLength(3);
    
    // Section 1: ID
    expect(header?.children[0]).toHaveTextContent(engine.getState().root.id.substring(0, 8));
    
    // Section 2: Title (should be test-widget since we don't have a name map in core)
    expect(header?.children[1]).toHaveTextContent('test-widget');
    
    // Section 3: Controls
    expect(header?.children[2].classList.contains('ug-controls')).toBe(true);
  });

  it('should render a maximized overlay when a tile is maximized', () => {
    const engine = new LayoutEngine();
    const tileId = engine.getState().root.id;
    
    render(
      <LayoutProvider engine={engine}>
        <UGLayout />
      </LayoutProvider>
    );

    // Initial state: no overlay
    expect(screen.queryByText(/Maximized View/i)).not.toBeInTheDocument();

    // Act: Maximize
    act(() => {
      engine.maximizeTile(tileId);
    });

    expect(screen.getByText(/Maximized View/i)).toBeInTheDocument();
  });

  it('should use CSS variables for themeable aesthetic styles', () => {
    render(
      <LayoutProvider engine={new LayoutEngine()}>
        <UGLayout />
      </LayoutProvider>
    );

    const tile = document.querySelector('.ug-tile') as HTMLElement;
    // We check if the style attribute contains the variable reference
    expect(tile.style.backgroundColor).toContain('var(--ug-tile-bg');
  });

  it('should render custom icons when provided in the config', () => {
    const customIcons = {
      splitH: <span data-testid="custom-split-h">SH</span>,
      remove: <span data-testid="custom-remove">RM</span>,
    };

    render(
      <LayoutProvider engine={new LayoutEngine()} config={{ icons: customIcons }}>
        <UGLayout />
      </LayoutProvider>
    );

    expect(screen.getByTestId('custom-split-h')).toBeInTheDocument();
    expect(screen.getByTestId('custom-remove')).toBeInTheDocument();
  });

  it('should reset a tile when the reset action is triggered', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    engine.updateTile(rootId, { contentId: 'test-widget' });
    
    const resetSpy = vi.spyOn(engine, 'resetTile');

    render(
      <LayoutProvider engine={engine} registry={{ 'test-widget': () => <div>Widget</div> }}>
        <UGLayout />
      </LayoutProvider>
    );

    const resetButton = screen.getByTitle(/Reset/i);
    fireEvent.click(resetButton);

    expect(resetSpy).toHaveBeenCalledWith(rootId);
  });
});
