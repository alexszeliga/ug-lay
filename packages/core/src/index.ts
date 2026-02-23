import { v4 as uuidv4 } from 'uuid';
import {
  LayoutNode,
  LayoutState,
  LayoutEngineConfig,
  Subscriber,
  TileNode,
  Direction,
} from './types';
import {
  findNode,
  recursiveUpdate,
  recursiveRemove,
  recursiveSplit,
  recursiveSwap,
} from './tree-utils';

export * from './types';
export { findNode } from './tree-utils';
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
export { HttpPersistenceAdapter } from './adapters/HttpPersistenceAdapter';

const DEFAULT_CONFIG: LayoutEngineConfig = {
  minRatio: 0.05,
  maxRatio: 0.95,
  defaultSplitRatio: 0.5,
  saveDebounceMs: 500,
};

export class LayoutEngine {
  private state: LayoutState;
  private subscribers: Subscriber[] = [];
  private config: LayoutEngineConfig;
  private saveTimer: any = null;

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
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notify(): void {
    this.state = { ...this.state };
    this.subscribers.forEach((sub) => sub(this.state));
    this.queueSave();
  }

  private queueSave(): void {
    if (!this.config.persistence) return;

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    const delay = this.config.saveDebounceMs ?? 500;

    if (delay === 0) {
      this.config.persistence.save(this.state);
    } else {
      this.saveTimer = setTimeout(() => {
        this.config.persistence?.save(this.state);
        this.saveTimer = null;
      }, delay);
    }
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
    const clampedRatio = Math.max(
      this.config.minRatio,
      Math.min(this.config.maxRatio, ratio)
    );
    this.state.root = recursiveUpdate(
      this.state.root,
      splitId,
      { ratio: clampedRatio },
      'split'
    );
    this.notify();
  }

  updateTile(
    tileId: string,
    updates: Partial<Omit<TileNode, 'id' | 'type'>>
  ): void {
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      updates,
      'tile'
    );
    this.notify();
  }

  resetTile(tileId: string): void {
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { contentId: undefined, metadata: undefined },
      'tile'
    );
    this.notify();
  }

  removeTile(tileId: string): void {
    if (this.state.root.id === tileId && this.state.root.type === 'tile') {
      return;
    }
    this.state.root = recursiveRemove(this.state.root, tileId);
    this.notify();
  }

  swapTiles(sourceId: string, targetId: string): void {
    const sourceNode = findNode(this.state.root, sourceId) as TileNode;
    const targetNode = findNode(this.state.root, targetId) as TileNode;
    if (
      !sourceNode ||
      !targetNode ||
      sourceNode.type !== 'tile' ||
      targetNode.type !== 'tile'
    )
      return;

    const sourceData = { ...sourceNode };
    const targetData = { ...targetNode };
    this.state.root = recursiveSwap(
      this.state.root,
      sourceId,
      targetId,
      sourceData,
      targetData
    );
    this.notify();
  }

  split(tileId: string, direction: Direction): void {
    this.state.root = recursiveSplit(
      this.state.root,
      tileId,
      direction,
      this.config.defaultSplitRatio
    );
    this.notify();
  }
}
