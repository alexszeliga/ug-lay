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
});
