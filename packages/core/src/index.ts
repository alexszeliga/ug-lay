import { v4 as uuidv4 } from 'uuid';

export type Direction = 'horizontal' | 'vertical';
export type TileType = 'tile' | 'split';

export interface BaseNode {
  id: string;
  type: TileType;
}

export interface TileNode extends BaseNode {
  type: 'tile';
  contentId?: string;
  metadata?: Record<string, any>;
}

export interface SplitNode extends BaseNode {
  type: 'split';
  direction: Direction;
  ratio: number;
  children: [LayoutNode, LayoutNode];
}

export type LayoutNode = TileNode | SplitNode;

export interface LayoutState {
  root: LayoutNode;
}

export type Subscriber = (state: LayoutState) => void;

export class LayoutEngine {
  private state: LayoutState;
  private subscribers: Subscriber[] = [];

  constructor(initialState?: LayoutState) {
    this.state = initialState || {
      root: {
        id: uuidv4(),
        type: 'tile',
      },
    };
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    // Return an unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify(): void {
    this.subscribers.forEach(sub => sub(this.state));
  }

  getState(): LayoutState {
    return this.state;
  }

  setRatio(splitId: string, ratio: number): void {
    this.state.root = this.recursiveUpdate(this.state.root, splitId, { ratio }, 'split');
    this.notify();
  }

  updateTile(tileId: string, updates: Partial<Omit<TileNode, 'id' | 'type'>>): void {
    this.state.root = this.recursiveUpdate(this.state.root, tileId, updates, 'tile');
    this.notify();
  }

  removeTile(tileId: string): void {
    // If the root is the tile to be removed, we can't do anything.
    if (this.state.root.id === tileId && this.state.root.type === 'tile') {
      console.warn('Cannot remove the root tile.');
      return;
    }
    this.state.root = this.recursiveRemove(this.state.root, tileId);
    this.notify();
  }

  swapTiles(sourceId: string, targetId: string): void {
    const sourceNode = this.findNode(this.state.root, sourceId) as TileNode;
    const targetNode = this.findNode(this.state.root, targetId) as TileNode;

    if (!sourceNode || !targetNode || sourceNode.type !== 'tile' || targetNode.type !== 'tile') {
      console.warn('Both source and target must be tiles to swap.');
      return;
    }

    const { contentId: sourceContent, metadata: sourceMeta } = sourceNode;
    const { contentId: targetContent, metadata: targetMeta } = targetNode;
    
    this.state.root = this.recursiveUpdate(this.state.root, sourceId, { contentId: targetContent, metadata: targetMeta }, 'tile');
    this.state.root = this.recursiveUpdate(this.state.root, targetId, { contentId: sourceContent, metadata: sourceMeta }, 'tile');
    
    this.notify();
  }

  split(tileId: string, direction: Direction): void {
    this.state.root = this.recursiveSplit(this.state.root, tileId, direction);
    this.notify();
  }

  private findNode(node: LayoutNode, id: string): LayoutNode | null {
    if (node.id === id) return node;
    if (node.type === 'split') {
      return this.findNode(node.children[0], id) || this.findNode(node.children[1], id);
    }
    return null;
  }

  private recursiveUpdate(
    node: LayoutNode,
    id: string,
    updates: any,
    expectedType?: TileType
  ): LayoutNode {
    if (node.id === id) {
      if (expectedType && node.type !== expectedType) {
        return node;
      }
      return { ...node, ...updates };
    }

    if (node.type === 'split') {
      return {
        ...node,
        children: [
          this.recursiveUpdate(node.children[0], id, updates, expectedType),
          this.recursiveUpdate(node.children[1], id, updates, expectedType),
        ],
      };
    }

    return node;
  }

  private recursiveRemove(node: LayoutNode, tileId: string): LayoutNode {
    if (node.type === 'tile') {
      return node;
    }

    // Check if one of the children is the tile to be removed
    const childA = node.children[0];
    const childB = node.children[1];

    if (childA.id === tileId) {
      // Promote child B
      return childB;
    }

    if (childB.id === tileId) {
      // Promote child A
      return childA;
    }

    // Recurse deeper
    return {
      ...node,
      children: [
        this.recursiveRemove(childA, tileId),
        this.recursiveRemove(childB, tileId),
      ],
    };
  }

  private recursiveSplit(
    node: LayoutNode,
    tileId: string,
    direction: Direction
  ): LayoutNode {
    if (node.type === 'tile') {
      if (node.id === tileId) {
        return {
          id: uuidv4(),
          type: 'split',
          direction,
          ratio: 0.5,
          children: [
            { id: uuidv4(), type: 'tile' },
            { id: uuidv4(), type: 'tile' },
          ],
        };
      }
      return node;
    }

    return {
      ...node,
      children: [
        this.recursiveSplit(node.children[0], tileId, direction),
        this.recursiveSplit(node.children[1], tileId, direction),
      ],
    };
  }
}
