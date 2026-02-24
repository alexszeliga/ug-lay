type Direction = 'horizontal' | 'vertical';
type TileType = 'tile' | 'split';
interface BaseNode {
    id: string;
    type: TileType;
}
interface TileTab<TMetadata = any> {
    id: string;
    contentId: string;
    metadata?: TMetadata;
}
interface TileNode<TMetadata = any> extends BaseNode {
    type: 'tile';
    contentId?: string;
    metadata?: TMetadata;
    tabs?: TileTab<TMetadata>[];
    activeTabIndex?: number;
}
interface SplitNode<TMetadata = any> extends BaseNode {
    type: 'split';
    direction: Direction;
    ratio: number;
    children: [LayoutNode<TMetadata>, LayoutNode<TMetadata>];
}
type LayoutNode<TMetadata = any> = TileNode<TMetadata> | SplitNode<TMetadata>;
interface LayoutState<TMetadata = any> {
    root: LayoutNode<TMetadata>;
    maximizedTileId: string | null;
}
interface LayoutEngineConfig<TMetadata = any> {
    minRatio: number;
    maxRatio: number;
    defaultSplitRatio: number;
    persistence?: PersistenceAdapter<TMetadata>;
    saveDebounceMs?: number;
}
interface PersistenceAdapter<TMetadata = any> {
    save(state: LayoutState<TMetadata>): Promise<void>;
    load(): Promise<LayoutState<TMetadata> | null>;
}
type Subscriber<TMetadata = any> = (state: LayoutState<TMetadata>) => void;
type DropAction = {
    type: 'swap';
} | {
    type: 'split';
    direction: Direction;
    side: 'before' | 'after';
};

interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}
interface Point {
    x: number;
    y: number;
}
/**
 * Normalizes pointer coordinates relative to a bounding rectangle.
 * Handles potential CSS transforms (scale, zoom) by relying on the
 * provided client-relative rectangle (usually from getBoundingClientRect).
 *
 * @param rect The bounding client rectangle of the target element.
 * @param clientX The pointer's X coordinate (client-relative).
 * @param clientY The pointer's Y coordinate (client-relative).
 * @returns An object containing normalized x and y (0 to 1).
 */
declare function normalizeCoordinates(rect: Rect, clientX: number, clientY: number): Point;
/**
 * Calculates a new ratio for a split based on a pointer position.
 *
 * @param rect The bounding client rectangle of the split container.
 * @param clientX The pointer's X coordinate.
 * @param clientY The pointer's Y coordinate.
 * @param direction The direction of the split.
 * @param gutterSize The size of the gutter in pixels.
 * @returns A ratio between 0 and 1.
 */
declare function calculateRatio(rect: Rect, clientX: number, clientY: number, direction: 'horizontal' | 'vertical', gutterSize?: number): number;

declare function getDropAction(rect: Rect, mouseX: number, mouseY: number): DropAction;
declare function findNode<T>(node: LayoutNode<T>, id: string): LayoutNode<T> | null;

declare class LocalStorageAdapter implements PersistenceAdapter {
    private key;
    constructor(key: string);
    save(state: LayoutState): Promise<void>;
    load(): Promise<LayoutState | null>;
}

declare class HttpPersistenceAdapter implements PersistenceAdapter {
    private url;
    private options;
    constructor(url: string, options?: RequestInit);
    save(state: LayoutState): Promise<void>;
    load(): Promise<LayoutState | null>;
}

declare class LayoutEngine<TMetadata = any> {
    private state;
    private subscribers;
    private config;
    private saveTimer;
    constructor(initialState?: LayoutState<TMetadata>, config?: Partial<LayoutEngineConfig<TMetadata>>);
    subscribe(callback: Subscriber<TMetadata>): () => void;
    private notify;
    private queueSave;
    getState(): LayoutState<TMetadata>;
    maximizeTile(tileId: string): void;
    minimize(): void;
    setRatio(splitId: string, ratio: number): void;
    updateTile(tileId: string, updates: Partial<Omit<TileNode<TMetadata>, 'id' | 'type'>>): void;
    resetTile(tileId: string): void;
    selectTab(tileId: string, index: number): void;
    addTab(tileId: string, contentId: string, metadata?: TMetadata): void;
    removeTab(tileId: string, tabId: string): void;
    removeTile(tileId: string): void;
    swapTiles(sourceId: string, targetId: string): void;
    split(tileId: string, direction: Direction): void;
    moveTile(sourceId: string, targetId: string, direction: Direction, side: 'before' | 'after'): void;
}

export { type BaseNode, type Direction, type DropAction, HttpPersistenceAdapter, LayoutEngine, type LayoutEngineConfig, type LayoutNode, type LayoutState, LocalStorageAdapter, type PersistenceAdapter, type Point, type Rect, type SplitNode, type Subscriber, type TileNode, type TileTab, type TileType, calculateRatio, findNode, getDropAction, normalizeCoordinates };
