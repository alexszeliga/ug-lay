// This is a test file for the swap functionality.
import { describe, it, expect } from 'vitest';
import { LayoutEngine, LayoutNode } from './index';

function findNode(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) return node;
  if (node.type === 'split') {
    return findNode(node.children[0], id) || findNode(node.children[1], id);
  }
  return null;
}

describe('LayoutEngine', () => {
  // ... existing tests ...

  it('should swap the content of two tiles', () => {
    const engine = new LayoutEngine();
    engine.split(engine.getState().root.id, 'horizontal');
    const root = engine.getState().root as any;
    const tileA_id = root.children[0].id;
    const tileB_id = root.children[1].id;

    engine.updateTile(tileA_id, { contentId: 'Widget-A' });
    engine.updateTile(tileB_id, { contentId: 'Widget-B' });

    // Act
    engine.swapTiles(tileA_id, tileB_id);

    // Assert
    const finalState = engine.getState();
    const tileA_after = findNode(finalState.root, tileA_id) as any;
    const tileB_after = findNode(finalState.root, tileB_id) as any;

    expect(tileA_after.contentId).toBe('Widget-B');
    expect(tileB_after.contentId).toBe('Widget-A');
  });
});
