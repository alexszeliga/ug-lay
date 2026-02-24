import { DevServerManager } from '../src/DevServerManager';

const manager = new DevServerManager({
  phpPort: 8000,
  vitePort: 5173,
});

manager.start().catch((err) => {
  console.error('Failed to start dev servers:', err);
  process.exit(1);
});
