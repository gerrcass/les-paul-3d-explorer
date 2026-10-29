import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1100,
    assetsInlineLimit: 0,
    sourcemap: false,
  },
});
