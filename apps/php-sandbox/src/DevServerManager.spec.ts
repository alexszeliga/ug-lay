import { describe, it, expect, vi } from 'vitest';
import { DevServerManager } from './DevServerManager';

describe('DevServerManager', () => {
  it('should construct the correct commands for PHP and Vite', () => {
    const manager = new DevServerManager({
      phpPort: 8000,
      vitePort: 3002,
    });

    const commands = manager.getCommands();
    expect(commands.php).toBe('php -S localhost:8000');
    expect(commands.vite).toBe('vite --port 3002');
  });
});
