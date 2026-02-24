import { describe, it, expect } from 'vitest';
import { findTile } from './utils';
import { LayoutNode } from '@ug-lay/core';

describe('React Utils: findTile', () => {
  it('should find a tile by ID at the root', () => {
    const root: LayoutNode = { id: '1', type: 'tile' };
    expect(findTile(root, '1')).toEqual(root);
  });

  it('should find a nested tile in a split', () => {
    const root: LayoutNode = {
      id: 'split-1',
      type: 'split',
      direction: 'horizontal',
      ratio: 0.5,
      children: [
        { id: 'tile-a', type: 'tile' },
        { id: 'tile-b', type: 'tile' }
      ]
    };
    expect(findTile(root, 'tile-b')).toEqual({ id: 'tile-b', type: 'tile' });
  });

  it('should return null if node is not a tile even if ID matches (though ID should be unique)', () => {
    const root: LayoutNode = {
      id: 'split-1',
      type: 'split',
      direction: 'horizontal',
      ratio: 0.5,
      children: [{ id: '2', type: 'tile' }, { id: '3', type: 'tile' }]
    };
    expect(findTile(root, 'split-1')).toBeNull();
  });

  it('should return null if tile is not found', () => {
    const root: LayoutNode = { id: '1', type: 'tile' };
    expect(findTile(root, '999')).toBeNull();
  });
});
