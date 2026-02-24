import { describe, it, expect } from 'vitest';

/**
 * Simulates the logic from the sandbox's mousemove handler.
 * @param rect - The bounding box of the split container.
 * @param mousePos - The current mouse position (e.g., event.clientX).
 * @param direction - The direction of the split.
 * @returns The new, calculated ratio.
 */
function calculateNewRatio(
  rect: { width: number; height: number; left: number; top: number },
  mousePos: number,
  direction: 'horizontal' | 'vertical'
): number {
  const gutterSize = 4;
  let newRatio;

  if (direction === 'horizontal') {
    const totalWidth = rect.width - gutterSize;
    // This is the flawed logic from the sandbox
    newRatio = (mousePos - rect.left - gutterSize / 2) / totalWidth;
  } else {
    const totalHeight = rect.height - gutterSize;
    newRatio = (mousePos - rect.top - gutterSize / 2) / totalHeight;
  }
  return newRatio;
}


describe('Layout Geometry Calculations', () => {
  it('should correctly calculate a new ratio from a mouse position', () => {
    const container = { width: 1000, height: 800, left: 100, top: 50 };
    const mouseX = 600; // Mouse is at 600px on the screen

    const newRatio = calculateNewRatio(container, mouseX, 'horizontal');
    
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
