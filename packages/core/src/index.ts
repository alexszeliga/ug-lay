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
  gutterSize: 4,
  dragThreshold: 5,
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

  get gutterSize(): number {
    return this.config.gutterSize ?? 4;
  }

  get dragThreshold(): number {
    return this.config.dragThreshold ?? 5;
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

  private mutate(updater: (root: LayoutNode<TMetadata>) => LayoutNode<TMetadata>): void {
    this.state.root = updater(this.state.root);
    this.notify();
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
    this.mutate(root => recursiveUpdate(root, splitId, { ratio: clampedRatio }, 'split'));
  }

  updateTile(
    tileId: string,
    updates: Partial<Omit<TileNode<TMetadata>, 'id' | 'type'>>
  ): void {
    this.mutate(root => recursiveUpdate(root, tileId, updates, 'tile'));
  }

  resetTile(tileId: string): void {
    this.mutate(root => recursiveUpdate(
      root,
      tileId,
      { contentId: undefined, metadata: undefined, tabs: undefined, activeTabIndex: undefined },
      'tile'
    ));
  }

  selectTab(tileId: string, index: number): void {
    this.mutate(root => recursiveUpdate(
      root,
      tileId,
      { activeTabIndex: index },
      'tile'
    ));
  }

  addTab(tileId: string, contentId: string, metadata?: TMetadata): void {
    const node = findNode(this.state.root, tileId) as TileNode<TMetadata>;
    if (!node || node.type !== 'tile') return;

    const newTab = { id: uuidv4(), contentId, metadata };
    let tabs = node.tabs ? [...node.tabs, newTab] : [];
    
    if (!node.tabs && node.contentId) {
      tabs = [
        { id: uuidv4(), contentId: node.contentId, metadata: node.metadata },
        newTab
      ];
    } else if (!node.tabs) {
      tabs = [newTab];
    }

    this.mutate(root => recursiveUpdate(
      root,
      tileId,
      { 
        tabs, 
        activeTabIndex: tabs.length - 1,
        contentId: undefined,
        metadata: undefined
      },
      'tile'
    ));
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

    this.mutate(root => recursiveUpdate(
      root,
      tileId,
      { tabs: newTabs, activeTabIndex: activeIndex },
      'tile'
    ));
  }

  removeTile(tileId: string): void {
    if (this.state.root.id === tileId && this.state.root.type === 'tile') return;
    this.mutate(root => recursiveRemove(root, tileId));
  }

  swapTiles(sourceId: string, targetId: string): void {
    const sourceNode = findNode(this.state.root, sourceId) as TileNode<TMetadata>;
    const targetNode = findNode(this.state.root, targetId) as TileNode<TMetadata>;
    if (!sourceNode || !targetNode || sourceNode.type !== 'tile' || targetNode.type !== 'tile') return;

    const sourceData = { ...sourceNode };
    const targetData = { ...targetNode };
    this.mutate(root => recursiveSwap(
      root,
      sourceId,
      targetId,
      sourceData,
      targetData
    ));
  }

  split(tileId: string, direction: Direction): void {
    this.mutate(root => recursiveSplit(
      root,
      tileId,
      direction,
      this.config.defaultSplitRatio
    ));
  }

  moveTile(sourceId: string, targetId: string, direction: Direction, side: 'before' | 'after'): void {
    if (sourceId === targetId) return;
    this.mutate(root => recursiveMove(
      root,
      sourceId,
      targetId,
      direction,
      side,
      this.config.defaultSplitRatio
    ));
  }
}
