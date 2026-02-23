// This is a test file for the swap functionality.
import { describe, it, expect } from 'vitest';
import { LayoutEngine, LayoutNode } from './index';

describe('LayoutEngine', () => {
  it('should swap the entire tile (including ID and content)', () => {
    const engine = new LayoutEngine();
    engine.split(engine.getState().root.id, 'horizontal');
    
    const rootBefore = engine.getState().root as any;
    const idA = rootBefore.children[0].id;
    const idB = rootBefore.children[1].id;

    engine.updateTile(idA, { contentId: 'Widget-A' });
    engine.updateTile(idB, { contentId: 'Widget-B' });

    // Act: Swap A and B
    engine.swapTiles(idA, idB);

    // Assert: The first child of the root should now be the tile that WAS B
    const rootAfter = engine.getState().root as any;
    expect(rootAfter.children[0].id).toBe(idB);
    expect(rootAfter.children[0].contentId).toBe('Widget-B');
    
    expect(rootAfter.children[1].id).toBe(idA);
    expect(rootAfter.children[1].contentId).toBe('Widget-A');
  });
});
