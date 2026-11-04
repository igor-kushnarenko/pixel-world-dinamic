import { defineConfig } from 'vite';
import fileSystemPlugin from './tools/file-system-plugin.mjs';
export default defineConfig({
  plugins: [fileSystemPlugin()],
  base: process.env.PAGES_BASE_PATH ?? './',
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true }
});
