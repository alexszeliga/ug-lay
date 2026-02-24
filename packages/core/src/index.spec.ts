import { describe, it, expect, vi } from 'vitest';
import { LayoutEngine, LayoutState } from './index';

describe('LayoutEngine', () => {
  it('should initialize with a root tile', () => {
    const engine = new LayoutEngine();
    const state = engine.getState();
    
    expect(state.root).toBeDefined();
    expect(state.root.id).toBeDefined();
    expect(state.root.type).toBe('tile');
  });

  it('should split the root tile into two children', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;

    engine.split(rootId, 'horizontal');

    const state = engine.getState();
    // After a split, the root is no longer a 'tile', it's a 'split' node
    expect(state.root.type).toBe('split');
    
    // It should have exactly two children
    const root = state.root as any; // Cast for now until we update types
    expect(root.children).toHaveLength(2);
    expect(root.direction).toBe('horizontal');
    expect(root.ratio).toBe(0.5);

    // The children should be tiles
    expect(root.children[0].type).toBe('tile');
    expect(root.children[1].type).toBe('tile');
    expect(root.children[0].id).not.toBe(root.children[1].id);
  });

  it('should allow nested splitting', () => {
    const engine = new LayoutEngine();
    engine.split(engine.getState().root.id, 'horizontal');
    
    const firstChildId = (engine.getState().root as any).children[0].id;
    engine.split(firstChildId, 'vertical');

    const state = engine.getState();
    const root = state.root as any;
    
    // First child of root should now be a split
    expect(root.children[0].type).toBe('split');
    expect(root.children[0].direction).toBe('vertical');
    expect(root.children[0].children).toHaveLength(2);
    
    // Second child of root should still be a tile
    expect(root.children[1].type).toBe('tile');
  });

  it('should adjust the ratio of a split node', () => {
    const engine = new LayoutEngine();
    engine.split(engine.getState().root.id, 'horizontal');
    
    const root = engine.getState().root as any;
    const splitId = root.id;

    engine.setRatio(splitId, 0.75);

    expect(engine.getState().root.type).toBe('split');
    expect((engine.getState().root as any).ratio).toBe(0.75);
  });

  it('should initialize with an initial state', () => {
    const initialState: LayoutState = {
      root: {
        id: '1',
        type: 'split',
        direction: 'horizontal',
        ratio: 0.3,
        children: [
          { id: '2', type: 'tile' },
          { id: '3', type: 'tile' },
        ],
      },
    };

    const engine = new LayoutEngine(initialState);
    expect(engine.getState()).toEqual(initialState);
  });

  it('should allow setting content on a tile', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;

    engine.updateTile(rootId, { contentId: 'my-widget' });

    const state = engine.getState();
    expect((state.root as any).contentId).toBe('my-widget');
  });

  it('should notify subscribers when state changes', () => {
    const engine = new LayoutEngine();
    const subscriber = vi.fn();

    engine.subscribe(subscriber);

    // Any action that changes the state should trigger the subscriber
    engine.split(engine.getState().root.id, 'horizontal');

    expect(subscriber).toHaveBeenCalled();
    expect(subscriber).toHaveBeenCalledWith(engine.getState());
  });

  it('should remove a tile and promote its sibling', () => {
    const engine = new LayoutEngine();
    // 1. Create a split
    engine.split(engine.getState().root.id, 'horizontal');
    const splitState = engine.getState().root as any;
    const tileA_id = splitState.children[0].id;
    const tileB_id = splitState.children[1].id;
    
    // 2. Remove Tile A
    engine.removeTile(tileA_id);

    // 3. Assert that Tile B is now the root
    const finalState = engine.getState();
    expect(finalState.root.id).toBe(tileB_id);
    expect(finalState.root.type).toBe('tile');
  });

  it('should remove a nested tile correctly', () => {
    const engine = new LayoutEngine();
    // Path: root -> split(A, B) -> split(C, D)
    engine.split(engine.getState().root.id, 'horizontal'); // Root -> A, B
    const root = engine.getState().root as any;
    const tileA_id = root.children[0].id;
    engine.split(tileA_id, 'vertical'); // A -> C, D

    const tileC_id = (engine.getState().root as any).children[0].children[0].id;
    
    engine.removeTile(tileC_id);

    // After removing C, D should be promoted and become A's replacement.
    const finalRoot = engine.getState().root as any;
    expect(finalRoot.children[0].type).toBe('tile'); // D is now the first child
    expect(finalRoot.children.length).toBe(2);
  });

  it('should allow maximizing and minimizing a tile', () => {
    const engine = new LayoutEngine();
    const tileId = engine.getState().root.id;

    engine.maximizeTile(tileId);
    expect(engine.getState().maximizedTileId).toBe(tileId);

    engine.minimize();
    expect(engine.getState().maximizedTileId).toBeNull();
  });

  it('should preserve existing content in the first child when splitting', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    
    // 1. Set some content
    engine.updateTile(rootId, { contentId: 'existing-content', metadata: { foo: 'bar' } });

    // 2. Split it
    engine.split(rootId, 'horizontal');

    // 3. Assert that the first child has the old content
    const state = engine.getState();
    const root = state.root as any;
    expect(root.children[0].contentId).toBe('existing-content');
    expect(root.children[0].metadata).toEqual({ foo: 'bar' });
    
    // 4. Assert that the second child is empty
    expect(root.children[1].contentId).toBeUndefined();
  });

  it('should respect custom configuration for min/max ratios', () => {
    const engine = new LayoutEngine(undefined, {
      minRatio: 0.2,
      maxRatio: 0.8
    });

    engine.split(engine.getState().root.id, 'horizontal');
    const splitId = engine.getState().root.id;

    // Try to set ratio below custom min
    engine.setRatio(splitId, 0.1);
    expect((engine.getState().root as any).ratio).toBe(0.2);

    // Try to set ratio above custom max
    engine.setRatio(splitId, 0.9);
    expect((engine.getState().root as any).ratio).toBe(0.8);
  });

  it('should return a new state reference when the state changes', () => {
    const engine = new LayoutEngine();
    const initialState = engine.getState();

    engine.split(initialState.root.id, 'horizontal');
    const newState = engine.getState();

    expect(newState).not.toBe(initialState);
  });

  it('should reset a tile by clearing its contentId and metadata', () => {
    const engine = new LayoutEngine();
    const rootId = engine.getState().root.id;
    
    engine.updateTile(rootId, { contentId: 'some-widget', metadata: { key: 'val' } });
    expect((engine.getState().root as any).contentId).toBe('some-widget');

    engine.resetTile(rootId);
    
    const state = engine.getState().root as any;
    expect(state.contentId).toBeUndefined();
    expect(state.metadata).toBeUndefined();
  });

  it('should move a tile to an edge by splitting the target and removing the source', () => {
    const engine = new LayoutEngine();
    // 1. Create two tiles: Root -> [A, B]
    engine.split(engine.getState().root.id, 'horizontal');
    const rootState = engine.getState().root as any;
    const idA = rootState.children[0].id;
    const idB = rootState.children[1].id;

    engine.updateTile(idA, { contentId: 'Source' });
    engine.updateTile(idB, { contentId: 'Target' });

    // 2. Act: Move A to the 'after' (right) edge of B
    engine.moveTile(idA, idB, 'horizontal', 'after');

    // 3. Assert
    const finalState = engine.getState();
    const newRoot = finalState.root as any;
    
    // The root split was promoted since A was removed from it.
    // The new root is the split that was created at B's position.
    expect(newRoot.type).toBe('split');
    expect(newRoot.children[0].contentId).toBe('Target');
    expect(newRoot.children[1].contentId).toBe('Source');
    expect(newRoot.children[1].id).toBe(idA);
  });
});
