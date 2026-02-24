import { v4 as uuidv4 } from 'uuid';
import { LayoutNode, TileNode, Direction, TileType, DropAction } from './types';
import { normalizeCoordinates, Rect } from './geometry';

export function getDropAction(
  rect: Rect,
  mouseX: number,
  mouseY: number
): DropAction {
  const threshold = 0.25; // Outer 25% of the tile triggers a split
  
  const { x, y } = normalizeCoordinates(rect, mouseX, mouseY);

  if (x < threshold) return { type: 'split', direction: 'horizontal', side: 'before' };
  if (x > 1 - threshold) return { type: 'split', direction: 'horizontal', side: 'after' };
  if (y < threshold) return { type: 'split', direction: 'vertical', side: 'before' };
  if (y > 1 - threshold) return { type: 'split', direction: 'vertical', side: 'after' };

  return { type: 'swap' };
}

export function findNode<T>(node: LayoutNode<T>, id: string): LayoutNode<T> | null {
  if (node.id === id) return node;
  if (node.type === 'split') {
    return findNode(node.children[0], id) || findNode(node.children[1], id);
  }
  return null;
}

export function recursiveUpdate<T>(
  node: LayoutNode<T>,
  id: string,
  updates: any,
  expectedType?: TileType
): LayoutNode<T> {
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

export function recursiveRemove<T>(node: LayoutNode<T>, tileId: string): LayoutNode<T> {
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

export function recursiveSplit<T>(
  node: LayoutNode<T>,
  tileId: string,
  direction: Direction,
  defaultRatio: number
): LayoutNode<T> {
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
      } as LayoutNode<T>;
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

export function recursiveSwap<T>(
  node: LayoutNode<T>,
  idA: string,
  idB: string,
  dataA: TileNode<T>,
  dataB: TileNode<T>
): LayoutNode<T> {
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

export function recursiveMove<T>(
  root: LayoutNode<T>,
  sourceId: string,
  targetId: string,
  direction: Direction,
  side: 'before' | 'after',
  defaultRatio: number
): LayoutNode<T> {
  const sourceNode = findNode(root, sourceId) as TileNode<T>;
  if (!sourceNode) return root;

  // 1. Remove the source node from its current position
  let newRoot = recursiveRemove(root, sourceId);

  // 2. Insert the source data into a new split at the target position
  const insertInSplit = (node: LayoutNode<T>): LayoutNode<T> => {
    if (node.id === targetId) {
      const newNode: LayoutNode<T> = {
        id: uuidv4(),
        type: 'split',
        direction,
        ratio: defaultRatio,
        children: side === 'before' 
          ? [{ ...sourceNode }, node] 
          : [node, { ...sourceNode }]
      };
      return newNode;
    }

    if (node.type === 'split') {
      return {
        ...node,
        children: [
          insertInSplit(node.children[0]),
          insertInSplit(node.children[1]),
        ]
      };
    }

    return node;
  };

  return insertInSplit(newRoot);
}
