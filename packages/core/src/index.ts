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

  split(tileId: string, direction: Direction): void {
    this.state.root = this.recursiveSplit(this.state.root, tileId, direction);
    this.notify();
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
