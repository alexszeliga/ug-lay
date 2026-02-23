import { LayoutEngine } from '@ug-layout/core';

export class SandboxState {
  focusedTileId: string | null = null;
  draggedTileId: string | null = null;
  engine: LayoutEngine;

  constructor(engine: LayoutEngine) {
    this.engine = engine;
    this.focusedTileId = engine.getState().root.id;
  }

  handleDrop(targetId: string) {
    if (this.draggedTileId && targetId !== this.draggedTileId) {
      // FIX: Update focus BEFORE triggering the engine notification
      this.focusedTileId = targetId;
      this.engine.swapTiles(this.draggedTileId, targetId);
    }
    this.draggedTileId = null;
  }
}
