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
  maximizedTileId: string | null;
}

export interface LayoutEngineConfig {
  minRatio: number;
  maxRatio: number;
  defaultSplitRatio: number;
}

const DEFAULT_CONFIG: LayoutEngineConfig = {
  minRatio: 0.05,
  maxRatio: 0.95,
  defaultSplitRatio: 0.5
};

export type Subscriber = (state: LayoutState) => void;

export class LayoutEngine {
  private state: LayoutState;
  private subscribers: Subscriber[] = [];
  private config: LayoutEngineConfig;

  constructor(initialState?: LayoutState, config?: Partial<LayoutEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = initialState || {
      root: {
        id: uuidv4(),
        type: 'tile',
      },
      maximizedTileId: null,
    };
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify(): void {
    // Create a new state reference to satisfy React's immutability requirements
    this.state = { ...this.state };
    this.subscribers.forEach(sub => sub(this.state));
  }

  getState(): LayoutState {
    return this.state;
  }

  maximizeTile(tileId: string): void {
    this.state.maximizedTileId = tileId;
    this.notify();
  }

  minimize(): void {
    this.state.maximizedTileId = null;
    this.notify();
  }

  setRatio(splitId: string, ratio: number): void {
    const clampedRatio = Math.max(this.config.minRatio, Math.min(this.config.maxRatio, ratio));
    this.state.root = this.recursiveUpdate(this.state.root, splitId, { ratio: clampedRatio }, 'split');
    this.notify();
  }

  updateTile(tileId: string, updates: Partial<Omit<TileNode, 'id' | 'type'>>): void {
    this.state.root = this.recursiveUpdate(this.state.root, tileId, updates, 'tile');
    this.notify();
  }

  removeTile(tileId: string): void {
    if (this.state.root.id === tileId && this.state.root.type === 'tile') {
      return;
    }
    this.state.root = this.recursiveRemove(this.state.root, tileId);
    this.notify();
  }

  swapTiles(sourceId: string, targetId: string): void {
    const sourceNode = this.findNode(this.state.root, sourceId) as TileNode;
    const targetNode = this.findNode(this.state.root, targetId) as TileNode;
    if (!sourceNode || !targetNode || sourceNode.type !== 'tile' || targetNode.type !== 'tile') return;

    const sourceData = { ...sourceNode };
    const targetData = { ...targetNode };
    this.state.root = this.recursiveSwap(this.state.root, sourceId, targetId, sourceData, targetData);
    this.notify();
  }

  private recursiveSwap(node: LayoutNode, idA: string, idB: string, dataA: TileNode, dataB: TileNode): LayoutNode {
    if (node.id === idA) return { ...dataB };
    if (node.id === idB) return { ...dataA };
    if (node.type === 'split') {
      return {
        ...node,
        children: [
          this.recursiveSwap(node.children[0], idA, idB, dataA, dataB),
          this.recursiveSwap(node.children[1], idA, idB, dataA, dataB),
        ],
      };
    }
    return node;
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

  private recursiveUpdate(node: LayoutNode, id: string, updates: any, expectedType?: TileType): LayoutNode {
    if (node.id === id) {
      if (expectedType && node.type !== expectedType) return node;
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
    if (node.type === 'tile') return node;
    const childA = node.children[0];
    const childB = node.children[1];
    if (childA.id === tileId) return childB;
    if (childB.id === tileId) return childA;
    return {
      ...node,
      children: [
        this.recursiveRemove(childA, tileId),
        this.recursiveRemove(childB, tileId),
      ],
    };
  }

  private recursiveSplit(node: LayoutNode, tileId: string, direction: Direction): LayoutNode {
    if (node.type === 'tile') {
      if (node.id === tileId) {
        return {
          id: uuidv4(),
          type: 'split',
          direction,
          ratio: this.config.defaultSplitRatio,
          children: [
            { 
              id: uuidv4(), 
              type: 'tile',
              contentId: node.contentId,
              metadata: node.metadata ? { ...node.metadata } : undefined
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
        this.recursiveSplit(node.children[0], tileId, direction),
        this.recursiveSplit(node.children[1], tileId, direction),
      ],
    };
  }
}
