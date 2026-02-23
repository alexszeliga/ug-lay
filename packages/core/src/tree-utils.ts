import { v4 as uuidv4 } from 'uuid';
import { LayoutNode, TileNode, Direction, TileType } from './types';

export function findNode(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) return node;
  if (node.type === 'split') {
    return findNode(node.children[0], id) || findNode(node.children[1], id);
  }
  return null;
}

export function recursiveUpdate(
  node: LayoutNode,
  id: string,
  updates: any,
  expectedType?: TileType
): LayoutNode {
  if (node.id === id) {
    if (expectedType && node.type !== expectedType) return node;
    return { ...node, ...updates };
  }
  if (node.type === 'split') {
    return {
      ...node,
      children: [
        recursiveUpdate(node.children[0], id, updates, expectedType),
        recursiveUpdate(node.children[1], id, updates, expectedType),
      ],
    };
  }
  return node;
}

export function recursiveRemove(node: LayoutNode, tileId: string): LayoutNode {
  if (node.type === 'tile') return node;
  const childA = node.children[0];
  const childB = node.children[1];
  if (childA.id === tileId) return childB;
  if (childB.id === tileId) return childA;
  return {
    ...node,
    children: [
      recursiveRemove(childA, tileId),
      recursiveRemove(childB, tileId),
    ],
  };
}

export function recursiveSplit(
  node: LayoutNode,
  tileId: string,
  direction: Direction,
  defaultRatio: number
): LayoutNode {
  if (node.type === 'tile') {
    if (node.id === tileId) {
      return {
        id: uuidv4(),
        type: 'split',
        direction,
        ratio: defaultRatio,
        children: [
          {
            id: uuidv4(),
            type: 'tile',
            contentId: node.contentId,
            metadata: node.metadata ? { ...node.metadata } : undefined,
          },
          { id: uuidv4(), type: 'tile' },
        ],
      };
    }
    return node;
  }
  return {
    ...node,
    children: [
      recursiveSplit(node.children[0], tileId, direction, defaultRatio),
      recursiveSplit(node.children[1], tileId, direction, defaultRatio),
    ],
  };
}

export function recursiveSwap(
  node: LayoutNode,
  idA: string,
  idB: string,
  dataA: TileNode,
  dataB: TileNode
): LayoutNode {
  if (node.id === idA) return { ...dataB };
  if (node.id === idB) return { ...dataA };
  if (node.type === 'split') {
    return {
      ...node,
      children: [
        recursiveSwap(node.children[0], idA, idB, dataA, dataB),
        recursiveSwap(node.children[1], idA, idB, dataA, dataB),
      ],
    };
  }
  return node;
}
