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

  it('should trigger a swap when dragging one tile onto another using PointerEvents', () => {
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
    const targetTile = target.closest('.ug-tile') as HTMLElement;
    
    // Mocking document.elementFromPoint to return our target tile
    document.elementFromPoint = vi.fn().mockReturnValue(targetTile);
    targetTile.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100, top: 0, width: 100, height: 100
    } as DOMRect);

    const downEvent = new CustomEvent('pointerdown', { bubbles: true }) as any;
    downEvent.button = 0;
    downEvent.clientX = 10;
    downEvent.clientY = 10;
    act(() => {
      fireEvent(source, downEvent);
    });
    
    // Trigger move to exceed threshold (5px)
    const moveEvent = new CustomEvent('pointermove', { bubbles: true }) as any;
    moveEvent.clientX = 150;
    moveEvent.clientY = 50;
    act(() => {
      window.dispatchEvent(moveEvent);
    });

    // Send a second move to actually trigger the target detection in the coordinator
    act(() => {
      window.dispatchEvent(moveEvent);
    });

    const upEvent = new CustomEvent('pointerup', { bubbles: true }) as any;
    upEvent.clientX = 150;
    upEvent.clientY = 50;
    act(() => {
      window.dispatchEvent(upEvent);
    });

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
    const controls = header?.children[2];
    expect(controls?.children).toHaveLength(6); // Add, Reset, Maximize, SplitH, SplitV, Remove
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

  it('should support strict component types in the registry', () => {
    const engine = new LayoutEngine();
    
    // We want to test that the component receives the correct props
    const MyComponent: React.FC<{ node: any }> = ({ node }) => (
      <div data-testid="strict-component">{node.contentId}</div>
    );

    const registry = {
      'test': MyComponent
    };

    engine.updateTile(engine.getState().root.id, { contentId: 'test' });

    render(
      <LayoutProvider engine={engine} registry={registry}>
        <UGLayout />
      </LayoutProvider>
    );

    expect(screen.getByTestId('strict-component')).toHaveTextContent('test');
  });

  it('should update split ratio when dragging the gutter', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    engine.split(rootId, 'horizontal');
    const splitId = engine.getState().root.id;
    
    const setRatioSpy = vi.spyOn(engine, 'setRatio');

    render(
      <LayoutProvider engine={engine}>
        <UGLayout />
      </LayoutProvider>
    );

    const gutter = document.querySelector('.ug-gutter') as HTMLElement;
    const split = document.querySelector('.ug-split') as HTMLElement;
    
    // Mock parent dimensions for ratio calculation
    // Split container: 1000px wide, from 0 to 1000
    vi.spyOn(split, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 1000, height: 1000, 
      right: 1000, bottom: 1000, x: 0, y: 0, toJSON: () => {}
    });

    // 1. PointerDown on gutter
    const downEvent = new CustomEvent('pointerdown', { bubbles: true }) as any;
    downEvent.button = 0;
    downEvent.clientX = 500;
    fireEvent(gutter, downEvent);

    // 2. PointerMove on window
    const moveEvent = new CustomEvent('pointermove', { bubbles: true }) as any;
    moveEvent.clientX = 750; // Move to 75%
    act(() => {
      window.dispatchEvent(moveEvent);
    });

    // 3. Assert
    // Gutter center at 750. Split width 1000. Gutter size 4.
    // calculateRatio: (750 - 0 - 2) / (1000 - 4) = 748 / 996 ≈ 0.751
    expect(setRatioSpy).toHaveBeenCalled();
    const calledRatio = setRatioSpy.mock.calls[0][1];
    expect(calledRatio).toBeCloseTo(0.75, 1);
    expect(setRatioSpy.mock.calls[0][0]).toBe(splitId);
  });
});
