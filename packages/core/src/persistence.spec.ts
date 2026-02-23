import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LayoutEngine } from './index';
import { PersistenceAdapter } from './types';

describe('LayoutEngine Persistence', () => {
  let mockAdapter: PersistenceAdapter;

  beforeEach(() => {
    mockAdapter = {
      save: vi.fn().mockResolvedValue(undefined),
      load: vi.fn().mockResolvedValue(null),
    };
    vi.useFakeTimers();
  });

  it('should call save on the adapter when the state changes', async () => {
    const engine = new LayoutEngine(undefined, {
      persistence: mockAdapter,
      saveDebounceMs: 0 // Disable debounce for this test
    });

    engine.split(engine.getState().root.id, 'horizontal');
    
    // We need to wait for the next tick if it's an async operation
    vi.runAllTimers();
    
    expect(mockAdapter.save).toHaveBeenCalled();
    const savedState = (mockAdapter.save as any).mock.calls[0][0];
    expect(savedState.root.type).toBe('split');
  });

  it('should debounce multiple rapid changes', () => {
    const engine = new LayoutEngine(undefined, {
      persistence: mockAdapter,
      saveDebounceMs: 100
    });

    const rootId = engine.getState().root.id;
    
    engine.split(rootId, 'horizontal');
    engine.setRatio(engine.getState().root.id, 0.6);
    engine.setRatio(engine.getState().root.id, 0.7);

    expect(mockAdapter.save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockAdapter.save).toHaveBeenCalledTimes(1);
    const finalState = (mockAdapter.save as any).mock.calls[0][0];
    expect((finalState.root as any).ratio).toBe(0.7);
  });
});
