import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { LayoutState } from '../types';

describe('LocalStorageAdapter', () => {
  const mockKey = 'test-layout';
  const mockState: LayoutState = {
    root: { id: '1', type: 'tile' },
    maximizedTileId: null
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('should save state to localStorage', async () => {
    const adapter = new LocalStorageAdapter(mockKey);
    await adapter.save(mockState);
    
    expect(localStorage.setItem).toHaveBeenCalledWith(`ug-layout:${mockKey}`, JSON.stringify(mockState));
  });

  it('should load state from localStorage', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockState));
    
    const adapter = new LocalStorageAdapter(mockKey);
    const loaded = await adapter.load();
    
    expect(localStorage.getItem).toHaveBeenCalledWith(`ug-layout:${mockKey}`);
    expect(loaded).toEqual(mockState);
  });

  it('should return null if no state exists', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const adapter = new LocalStorageAdapter(mockKey);
    const loaded = await adapter.load();
    
    expect(loaded).toBeNull();
  });

  it('should return null and not crash on invalid JSON', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');
    
    const adapter = new LocalStorageAdapter(mockKey);
    const loaded = await adapter.load();
    
    expect(loaded).toBeNull();
  });
});
