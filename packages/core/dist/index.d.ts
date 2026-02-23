type Direction = 'horizontal' | 'vertical';
type TileType = 'tile' | 'split';
interface BaseNode {
    id: string;
    type: TileType;
}
interface TileNode extends BaseNode {
    type: 'tile';
    contentId?: string;
    metadata?: Record<string, any>;
}
interface SplitNode extends BaseNode {
    type: 'split';
    direction: Direction;
    ratio: number;
    children: [LayoutNode, LayoutNode];
}
type LayoutNode = TileNode | SplitNode;
interface LayoutState {
    root: LayoutNode;
    maximizedTileId: string | null;
}
interface LayoutEngineConfig {
    minRatio: number;
    maxRatio: number;
    defaultSplitRatio: number;
}
type Subscriber = (state: LayoutState) => void;

declare function findNode(node: LayoutNode, id: string): LayoutNode | null;

declare class LayoutEngine {
    private state;
    private subscribers;
    private config;
    constructor(initialState?: LayoutState, config?: Partial<LayoutEngineConfig>);
    subscribe(callback: Subscriber): () => void;
    private notify;
    getState(): LayoutState;
    maximizeTile(tileId: string): void;
    minimize(): void;
    setRatio(splitId: string, ratio: number): void;
    updateTile(tileId: string, updates: Partial<Omit<TileNode, 'id' | 'type'>>): void;
    removeTile(tileId: string): void;
    swapTiles(sourceId: string, targetId: string): void;
    split(tileId: string, direction: Direction): void;
}

export { type BaseNode, type Direction, LayoutEngine, type LayoutEngineConfig, type LayoutNode, type LayoutState, type SplitNode, type Subscriber, type TileNode, type TileType, findNode };
