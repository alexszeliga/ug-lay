import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpPersistenceAdapter } from './HttpPersistenceAdapter';
import { LayoutState } from '../types';

describe('HttpPersistenceAdapter', () => {
  const mockUrl = 'https://api.example.com/layout';
  const mockState: LayoutState = {
    root: { id: '1', type: 'tile' },
    maximizedTileId: null
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should send POST request when saving', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    
    const adapter = new HttpPersistenceAdapter(mockUrl);
    await adapter.save(mockState);
    
    expect(fetch).toHaveBeenCalledWith(mockUrl, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(mockState),
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }));
  });

  it('should send GET request when loading', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockState
    } as Response);
    
    const adapter = new HttpPersistenceAdapter(mockUrl);
    const loaded = await adapter.load();
    
    expect(fetch).toHaveBeenCalledWith(mockUrl, expect.objectContaining({
      method: 'GET'
    }));
    expect(loaded).toEqual(mockState);
  });

  it('should return null on 404 status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404
    } as Response);
    
    const adapter = new HttpPersistenceAdapter(mockUrl);
    const loaded = await adapter.load();
    
    expect(loaded).toBeNull();
  });

  it('should throw error on failed save', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error'
    } as Response);
    
    const adapter = new HttpPersistenceAdapter(mockUrl);
    await expect(adapter.save(mockState)).rejects.toThrow('Failed to save layout: Internal Server Error');
  });
});
