import { v4 as uuidv4 } from 'uuid';

export type TileType = 'tile' | 'split';

export interface Tile {
  id: string;
  type: TileType;
}

export interface LayoutState {
  root: Tile;
}

export class LayoutEngine {
  private state: LayoutState;

  constructor() {
    this.state = {
      root: {
        id: 'root', // Static for now, will use uuid later if needed
        type: 'tile',
      },
    };
  }

  getState(): LayoutState {
    return this.state;
  }
}
