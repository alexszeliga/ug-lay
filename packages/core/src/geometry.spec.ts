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
