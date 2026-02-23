import { v4 as uuidv4 } from 'uuid';

export type Direction = 'horizontal' | 'vertical';
export type TileType = 'tile' | 'split';

export interface BaseNode {
  id: string;
  type: TileType;
}

export interface TileNode extends BaseNode {
  type: 'tile';
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

export class LayoutEngine {
  private state: LayoutState;

  constructor() {
    this.state = {
      root: {
        id: uuidv4(),
        type: 'tile',
      },
    };
  }

  getState(): LayoutState {
    return this.state;
  }

  split(tileId: string, direction: Direction): void {
    this.state.root = this.recursiveSplit(this.state.root, tileId, direction);
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
