export type Direction = 'horizontal' | 'vertical';
export type TileType = 'tile' | 'split';

export interface BaseNode {
  id: string;
  type: TileType;
}

export interface TileNode<TMetadata = any> extends BaseNode {
  type: 'tile';
  contentId?: string;
  metadata?: TMetadata;
}

export interface SplitNode<TMetadata = any> extends BaseNode {
  type: 'split';
  direction: Direction;
  ratio: number;
  children: [LayoutNode<TMetadata>, LayoutNode<TMetadata>];
}

export type LayoutNode<TMetadata = any> = TileNode<TMetadata> | SplitNode<TMetadata>;

export interface LayoutState<TMetadata = any> {
  root: LayoutNode<TMetadata>;
  maximizedTileId: string | null;
}

export interface LayoutEngineConfig<TMetadata = any> {
  minRatio: number;
  maxRatio: number;
  defaultSplitRatio: number;
  persistence?: PersistenceAdapter<TMetadata>;
  saveDebounceMs?: number;
}

export interface PersistenceAdapter<TMetadata = any> {
  save(state: LayoutState<TMetadata>): Promise<void>;
  load(): Promise<LayoutState<TMetadata> | null>;
}

export type Subscriber<TMetadata = any> = (state: LayoutState<TMetadata>) => void;

export type DropAction = 
  | { type: 'swap' }
  | { type: 'split'; direction: Direction; side: 'before' | 'after' };
