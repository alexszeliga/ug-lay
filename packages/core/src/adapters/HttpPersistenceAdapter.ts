import { PersistenceAdapter, LayoutState } from '../types';

export class HttpPersistenceAdapter implements PersistenceAdapter {
  constructor(private url: string, private options: RequestInit = {}) {}

  async save(state: LayoutState): Promise<void> {
    const response = await fetch(this.url, {
      ...this.options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.headers || {}),
      },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      throw new Error(`Failed to save layout: ${response.statusText}`);
    }
  }

  async load(): Promise<LayoutState | null> {
    const response = await fetch(this.url, {
      ...this.options,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(this.options.headers || {}),
      },
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`Failed to load layout: ${response.statusText}`);
    }

    return response.json();
  }
}
