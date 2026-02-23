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
  persistence?: PersistenceAdapter;
  saveDebounceMs?: number;
}

export interface PersistenceAdapter {
  save(state: LayoutState): Promise<void>;
  load(): Promise<LayoutState | null>;
}

export type Subscriber = (state: LayoutState) => void;
