import { describe, it, expect } from 'vitest';
import { LayoutEngine } from './index';

interface MyMetadata {
  permissions: string[];
  theme: 'light' | 'dark';
}

describe('LayoutEngine Type Hardening', () => {
  it('should support generic metadata types', () => {
    // This is primarily a compile-time check, but we'll verify runtime behavior
    const engine = new LayoutEngine<MyMetadata>();
    const rootId = engine.getState().root.id;

    const metadata: MyMetadata = {
      permissions: ['read', 'write'],
      theme: 'dark'
    };

    engine.updateTile(rootId, { metadata });

    const state = engine.getState();
    const root = state.root as any;
    
    expect(root.metadata).toEqual(metadata);
    expect(root.metadata.theme).toBe('dark');
  });
});
