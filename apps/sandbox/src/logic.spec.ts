import { describe, it, expect, vi } from 'vitest';
import { LayoutEngine } from '@ug-lay/core';
import { SandboxState } from './logic';

describe('Sandbox Logic', () => {
  it('should update focus BEFORE the engine notifies subscribers during a drop', () => {
    const engine = new LayoutEngine();
    engine.split(engine.getState().root.id, 'horizontal');
    const state = new SandboxState(engine);
    
    const root = engine.getState().root as any;
    const tileA = root.children[0].id;
    const tileB = root.children[1].id;

    state.draggedTileId = tileA;

    // We want to verify that when the engine notifies, the focusedTileId is already updated
    let focusAtTimeOfNotification: string | null = null;
    engine.subscribe(() => {
      focusAtTimeOfNotification = state.focusedTileId;
    });

    state.handleDrop(tileB);

    expect(focusAtTimeOfNotification).toBe(tileB);
  });

  it('should only allow dragging from a specific handle selector', () => {
    const engine = new LayoutEngine();
    const state = new SandboxState(engine);
    state.dragHandleSelector = '.drag-handle';

    const handleEl = { 
      closest: (s: string) => s === '.drag-handle' ? { id: 'handle' } : null 
    } as any;
    
    const contentEl = { 
      closest: (s: string) => s === '.drag-handle' ? null : null 
    } as any;

    state.lastMouseDownTarget = handleEl;
    expect(state.canStartDrag({} as any)).toBe(true);

    state.lastMouseDownTarget = contentEl;
    expect(state.canStartDrag({} as any)).toBe(false);
  });
});
