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
});
