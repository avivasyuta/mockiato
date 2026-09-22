import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// bundling the background service worker using Vite
export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    emptyOutDir: false,
    lib: {
      entry: 'src/scripts/background.ts',
      name: 'mockiato',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.js',
      },
    },
  },
});
