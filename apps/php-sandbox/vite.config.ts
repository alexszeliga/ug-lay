import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@ug-layout/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000', // Proxy API calls to PHP
    },
    port: 3002
  },
});
