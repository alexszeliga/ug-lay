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

    // We expect to find two tiles
    const tiles = screen.getAllByText(/Tile/i);
    expect(tiles).toHaveLength(2);

    // We expect to find a gutter
    const gutter = document.querySelector('.ug-gutter');
    expect(gutter).toBeDefined();

    // Simulate mousedown to see if it crashes (hoisting check)
    if (gutter) {
      gutter.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  });
});
