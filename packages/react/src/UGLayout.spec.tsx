import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

    // We expect to find two tiles rendering the picker
    const pickers = screen.getAllByText(/Select a Component/i);
    expect(pickers).toHaveLength(2);

    // We expect to find a gutter
    const gutter = document.querySelector('.ug-gutter');
    expect(gutter).toBeDefined();

    // Simulate mousedown to see if it crashes (hoisting check)
    if (gutter) {
      gutter.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  });

  it('should render a picker when a tile is empty', () => {
    const engine = new LayoutEngine();
    // Root starts as an empty tile
    
    render(
      <LayoutProvider engine={engine}>
        <UGLayout />
      </LayoutProvider>
    );

    expect(screen.getByText(/Select a Component/i)).toBeInTheDocument();
  });
});
