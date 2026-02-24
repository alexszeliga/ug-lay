import { useRef, useCallback, useEffect } from 'react';
import { DropAction, getDropAction, LayoutEngine } from '@ug-lay/core';
import { DragState } from '../context';

export interface UseDragCoordinatorProps<TMetadata = any> {
  engine: LayoutEngine<TMetadata>;
  dragState: DragState | null;
  setDragState: (state: DragState | null) => void;
}

export function useDragCoordinator<TMetadata = any>({ engine, dragState, setDragState }: UseDragCoordinatorProps<TMetadata>) {
  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  const handlePointerUp = useCallback(() => {
    const latest = dragStateRef.current;
    if (latest && latest.targetId && latest.dropAction) {
      if (latest.dropAction.type === 'swap') {
        engine.swapTiles(latest.id, latest.targetId);
      } else {
        engine.moveTile(
          latest.id, 
          latest.targetId, 
          latest.dropAction.direction, 
          latest.dropAction.side
        );
      }
    }
    dragStateRef.current = null;
    setDragState(null);
  }, [engine, setDragState]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const current = dragStateRef.current;
    if (!current) return;

    // Find what we are over
    const elementOver = document.elementFromPoint(e.clientX, e.clientY);
    const tileOver = elementOver?.closest('.ug-tile') as HTMLElement | null;
    let targetId: string | null = null;
    let dropAction: DropAction | null = null;

    if (tileOver) {
      targetId = tileOver.getAttribute('data-tile-id');
      if (targetId && targetId !== current.id) {
        const rect = tileOver.getBoundingClientRect();
        dropAction = getDropAction(rect, e.clientX, e.clientY);
      } else {
        targetId = null;
      }
    }

    const nextState = {
      ...current,
      clientX: e.clientX,
      clientY: e.clientY,
      targetId,
      dropAction
    };
    dragStateRef.current = nextState;
    setDragState(nextState);
  }, [setDragState]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const startDrag = useCallback((id: string, clientX: number, clientY: number) => {
    const initialState = {
      id,
      clientX,
      clientY,
      targetId: null,
      dropAction: null
    };
    dragStateRef.current = initialState;
    setDragState(initialState);
  }, [setDragState]);

  return { startDrag };
}
