import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDragCoordinator } from './useDragCoordinator';
import { LayoutEngine } from '@ug-lay/core';

describe('useDragCoordinator cleanup', () => {
  let engine: LayoutEngine;
  
  beforeEach(() => {
    engine = new LayoutEngine();
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
    document.elementFromPoint = vi.fn();
  });

  it('should remove window listeners on unmount', () => {
    const { unmount } = renderHook(() => useDragCoordinator({ 
      engine, 
      dragState: null, 
      setDragState: vi.fn() 
    }));

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
  });

  it('should update dragState when moving if a drag is active', () => {
    const setDragState = vi.fn();
    const mockDragState = {
      id: 'tile-1',
      clientX: 0,
      clientY: 0,
      targetId: null,
      dropAction: null
    };

    renderHook(() => useDragCoordinator({ 
      engine, 
      dragState: mockDragState, 
      setDragState 
    }));

    // Dispatch a window event
    const moveEvent = new CustomEvent('pointermove', { bubbles: true }) as any;
    moveEvent.clientX = 100;
    moveEvent.clientY = 100;
    
    act(() => {
      window.dispatchEvent(moveEvent);
    });

    expect(setDragState).toHaveBeenCalledWith(expect.objectContaining({
      clientX: 100,
      clientY: 100
    }));
  });
});
