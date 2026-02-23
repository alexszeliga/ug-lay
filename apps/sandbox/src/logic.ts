import { LayoutEngine } from '@ug-layout/core';

export class SandboxState {
  focusedTileId: string | null = null;
  draggedTileId: string | null = null;
  dragHandleSelector: string | null = null;
  engine: LayoutEngine;

  constructor(engine: LayoutEngine) {
    this.engine = engine;
    this.focusedTileId = engine.getState().root.id;
  }

  canStartDrag(el: HTMLElement): boolean {
    if (!this.dragHandleSelector) return true;
    return !!el.closest(this.dragHandleSelector);
  }

  handleDrop(targetId: string) {
    if (this.draggedTileId && targetId !== this.draggedTileId) {
      this.focusedTileId = targetId;
      this.engine.swapTiles(this.draggedTileId, targetId);
    }
    this.draggedTileId = null;
  }
}
