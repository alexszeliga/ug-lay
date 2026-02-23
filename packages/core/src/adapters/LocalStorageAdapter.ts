import { PersistenceAdapter, LayoutState } from '../types';

export class LocalStorageAdapter implements PersistenceAdapter {
  private key: string;

  constructor(key: string) {
    this.key = `ug-layout:${key}`;
  }

  async save(state: LayoutState): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save layout to LocalStorage', e);
    }
  }

  async load(): Promise<LayoutState | null> {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load layout from LocalStorage', e);
      return null;
    }
  }
}
