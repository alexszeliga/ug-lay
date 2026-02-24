import { describe, it, expect } from 'vitest';
import { normalizeCoordinates, calculateRatio } from './geometry';

describe('Layout Geometry Calculations', () => {
  it('should correctly normalize coordinates', () => {
    const rect = { left: 100, top: 100, width: 200, height: 200 };
    const { x, y } = normalizeCoordinates(rect, 150, 250);
    
    expect(x).toBe(0.25); // (150-100)/200
    expect(y).toBe(0.75); // (250-100)/200
  });

  it('should correctly calculate a new ratio from a mouse position', () => {
    const container = { width: 1000, height: 800, left: 100, top: 50 };
    const mouseX = 600; // Mouse is at 600px on the screen

    const newRatio = calculateRatio(container, mouseX, 400, 'horizontal');
    
    // Container is 1000px wide, starts at 100px. So it spans 100-1100.
    // Gutter is 4px. Total space is 996.
    // Mouse is at 600px, which is 500px into the container.
    // We subtract half the gutter to center it: 498px.
    // Ratio = 498 / 996 = 0.5
    expect(newRatio).toBeCloseTo(0.5, 2);
  });
});

describe('Drop Position Logic', () => {
  const rect = { width: 400, height: 400, left: 0, top: 0 };

  it('should identify a SWAP when in the center', async () => {
    const { getDropAction } = await import('./tree-utils');
    const action = getDropAction(rect, 200, 200); // Dead center
    expect(action.type).toBe('swap');
  });

  it('should identify a SPLIT when near an edge', async () => {
    const { getDropAction } = await import('./tree-utils');
    
    const leftEdge = getDropAction(rect, 10, 200);
    expect(leftEdge.type).toBe('split');
    expect(leftEdge.direction).toBe('horizontal');
    expect(leftEdge.side).toBe('before');

    const topEdge = getDropAction(rect, 200, 10);
    expect(topEdge.type).toBe('split');
    expect(topEdge.direction).toBe('vertical');
    expect(topEdge.side).toBe('before');
  });
});
