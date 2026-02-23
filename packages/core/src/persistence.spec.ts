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
      saveDebounceMs: 0
    });

    engine.split(engine.getState().root.id, 'horizontal');
    vi.runAllTimers();
    
    expect(mockAdapter.save).toHaveBeenCalled();
  });

  it('should debounce multiple rapid changes', () => {
    const engine = new LayoutEngine(undefined, {
      persistence: mockAdapter,
      saveDebounceMs: 100
    });

    const rootId = engine.getState().root.id;
    engine.split(rootId, 'horizontal');
    engine.setRatio(engine.getState().root.id, 0.6);
    vi.advanceTimersByTime(100);

    expect(mockAdapter.save).toHaveBeenCalledTimes(1);
  });

  it('HttpPersistenceAdapter should send POST requests on save', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    vi.stubGlobal('fetch', fetchMock);

    const { HttpPersistenceAdapter } = await import('./adapters/HttpPersistenceAdapter');
    const adapter = new HttpPersistenceAdapter('/api/layout');
    const dummyState = { root: { id: '1', type: 'tile' }, maximizedTileId: null } as any;

    await adapter.save(dummyState);

    expect(fetchMock).toHaveBeenCalledWith('/api/layout', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(dummyState)
    }));
  });
});
