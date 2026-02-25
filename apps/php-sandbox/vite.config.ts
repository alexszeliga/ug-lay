import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEV_CONFIG } from './dev-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@ug-lay/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  server: {
    port: DEV_CONFIG.vitePort,
    proxy: {
      '/api': `http://localhost:${DEV_CONFIG.phpPort}`, // Proxy API calls to PHP
    },
  },
});
