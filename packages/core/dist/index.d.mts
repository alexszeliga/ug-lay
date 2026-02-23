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
}
declare class LayoutEngine {
    private state;
    constructor(initialState?: LayoutState);
    getState(): LayoutState;
    setRatio(splitId: string, ratio: number): void;
    updateTile(tileId: string, updates: Partial<Omit<TileNode, 'id' | 'type'>>): void;
    split(tileId: string, direction: Direction): void;
    private recursiveUpdate;
    private recursiveSplit;
}

export { type BaseNode, type Direction, LayoutEngine, type LayoutNode, type LayoutState, type SplitNode, type TileNode, type TileType };
