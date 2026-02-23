import { LayoutNode, TileNode } from '@ug-layout/core';

export function findTile(node: LayoutNode, id: string): TileNode | null {
  if (node.id === id && node.type === 'tile') return node;
  if (node.type === 'split') {
    return findTile(node.children[0], id) || findTile(node.children[1], id);
  }
  return null;
}
