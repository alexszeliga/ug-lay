import { DevServerManager } from '../src/DevServerManager.js';
import { DEV_CONFIG } from '../dev-config.js'

const manager = new DevServerManager(DEV_CONFIG);

manager.start().catch((err) => {
  console.error('Failed to start dev servers:', err);
  process.exit(1);
});
