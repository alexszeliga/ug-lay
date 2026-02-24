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
  recursiveMove,
} from './tree-utils';

export * from './types';
export * from './geometry';
export { findNode, getDropAction } from './tree-utils';
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
export { HttpPersistenceAdapter } from './adapters/HttpPersistenceAdapter';

const DEFAULT_CONFIG: LayoutEngineConfig = {
  minRatio: 0.05,
  maxRatio: 0.95,
  defaultSplitRatio: 0.5,
  saveDebounceMs: 500,
};

export class LayoutEngine<TMetadata = any> {
  private state: LayoutState<TMetadata>;
  private subscribers: Subscriber<TMetadata>[] = [];
  private config: LayoutEngineConfig<TMetadata>;
  private saveTimer: any = null;

  constructor(initialState?: LayoutState<TMetadata>, config?: Partial<LayoutEngineConfig<TMetadata>>) {
    this.config = { ...DEFAULT_CONFIG, ...config } as LayoutEngineConfig<TMetadata>;
    this.state = initialState || {
      root: {
        id: uuidv4(),
        type: 'tile',
      },
      maximizedTileId: null,
    };
  }

  subscribe(callback: Subscriber<TMetadata>): () => void {
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
    if (this.saveTimer) clearTimeout(this.saveTimer);
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

  getState(): LayoutState<TMetadata> {
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
    updates: Partial<Omit<TileNode<TMetadata>, 'id' | 'type'>>
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
      { contentId: undefined, metadata: undefined, tabs: undefined, activeTabIndex: undefined },
      'tile'
    );
    this.notify();
  }

  selectTab(tileId: string, index: number): void {
    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { activeTabIndex: index },
      'tile'
    );
    this.notify();
  }

  addTab(tileId: string, contentId: string, metadata?: TMetadata): void {
    const node = findNode(this.state.root, tileId) as TileNode<TMetadata>;
    if (!node || node.type !== 'tile') return;

    const newTab = { id: uuidv4(), contentId, metadata };
    let tabs = node.tabs ? [...node.tabs, newTab] : [];
    
    // If no tabs exist, but it has content, convert content to first tab
    if (!node.tabs && node.contentId) {
      tabs = [
        { id: uuidv4(), contentId: node.contentId, metadata: node.metadata },
        newTab
      ];
    } else if (!node.tabs) {
      tabs = [newTab];
    }

    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { 
        tabs, 
        activeTabIndex: tabs.length - 1,
        // Clear legacy single-content fields when moving to tabs
        contentId: undefined,
        metadata: undefined
      },
      'tile'
    );
    this.notify();
  }

  removeTab(tileId: string, tabId: string): void {
    const node = findNode(this.state.root, tileId) as TileNode<TMetadata>;
    if (!node || !node.tabs) return;

    const newTabs = node.tabs.filter(t => t.id !== tabId);
    if (newTabs.length === 0) {
      this.resetTile(tileId);
      return;
    }

    let activeIndex = node.activeTabIndex ?? 0;
    if (activeIndex >= newTabs.length) {
      activeIndex = newTabs.length - 1;
    }

    this.state.root = recursiveUpdate(
      this.state.root,
      tileId,
      { tabs: newTabs, activeTabIndex: activeIndex },
      'tile'
    );
    this.notify();
  }

  removeTile(tileId: string): void {
    if (this.state.root.id === tileId && this.state.root.type === 'tile') return;
    this.state.root = recursiveRemove(this.state.root, tileId);
    this.notify();
  }

  swapTiles(sourceId: string, targetId: string): void {
    const sourceNode = findNode(this.state.root, sourceId) as TileNode<TMetadata>;
    const targetNode = findNode(this.state.root, targetId) as TileNode<TMetadata>;
    if (!sourceNode || !targetNode || sourceNode.type !== 'tile' || targetNode.type !== 'tile') return;

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

  moveTile(sourceId: string, targetId: string, direction: Direction, side: 'before' | 'after'): void {
    if (sourceId === targetId) return;
    this.state.root = recursiveMove(
      this.state.root,
      sourceId,
      targetId,
      direction,
      side,
      this.config.defaultSplitRatio
    );
    this.notify();
  }
}
