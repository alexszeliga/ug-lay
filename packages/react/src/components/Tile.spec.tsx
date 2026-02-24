import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutProvider } from '../context';
import { TileComponent } from './Tile';
import { LayoutEngine } from '@ug-layout/core';

describe('TileComponent Tabs', () => {
  const registry = {
    'widget-1': () => <div data-testid="w1">Widget 1</div>,
    'widget-2': () => <div data-testid="w2">Widget 2</div>,
  };

  it('should render multiple tabs and allow switching', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    
    // Add two tabs
    engine.addTab(rootId, 'widget-1');
    engine.addTab(rootId, 'widget-2');
    
    const selectTabSpy = vi.spyOn(engine, 'selectTab');

    render(
      <LayoutProvider engine={engine} registry={registry}>
        <TileComponent node={engine.getState().root as any} />
      </LayoutProvider>
    );

    // Verify both tab labels are present
    expect(screen.getByText('widget-1')).toBeInTheDocument();
    expect(screen.getByText('widget-2')).toBeInTheDocument();

    // Verify active tab content is shown (widget-2 should be active by default since it was added last)
    expect(screen.getByTestId('w2')).toBeInTheDocument();
    expect(screen.queryByTestId('w1')).not.toBeInTheDocument();

    // Click first tab
    fireEvent.click(screen.getByText('widget-1'));
    expect(selectTabSpy).toHaveBeenCalledWith(rootId, 0);
  });

  it('should allow removing a tab', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    
    engine.addTab(rootId, 'widget-1');
    engine.addTab(rootId, 'widget-2');
    
    const removeTabSpy = vi.spyOn(engine, 'removeTab');
    const tabs = (engine.getState().root as any).tabs;

    render(
      <LayoutProvider engine={engine} registry={registry}>
        <TileComponent node={engine.getState().root as any} />
      </LayoutProvider>
    );

    // Find the "×" (close button) for the first tab
    const closeButtons = screen.getAllByText('×');
    fireEvent.click(closeButtons[0]);

    expect(removeTabSpy).toHaveBeenCalledWith(rootId, tabs[0].id);
  });

  it('should show the picker when "Add Tab" is clicked', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    engine.updateTile(rootId, { contentId: 'widget-1' });

    render(
      <LayoutProvider engine={engine} registry={registry}>
        <TileComponent node={engine.getState().root as any} />
      </LayoutProvider>
    );

    // Initially no picker
    expect(screen.queryByText('Select a Component')).not.toBeInTheDocument();

    // Click "Add Tab" control button (using title from Tile.tsx)
    const addButton = screen.getByTitle('Add Tab');
    fireEvent.click(addButton);

    // Picker should appear
    expect(screen.getByText('Select a Component')).toBeInTheDocument();
  });
});
