import { describe, it, expect } from 'vitest';
import { LayoutEngine } from './index';

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
});
