import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// bundling the mockiato script using Vite
export default defineConfig({
    plugins: [tsconfigPaths()],
    build: {
        outDir: 'dist',
        cssCodeSplit: false,
        emptyOutDir: false,
        lib: {
            entry: 'src/scripts/mockiato.ts',
            name: 'mockiato',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                entryFileNames: 'mockiato.js',
            },
        },
    },
});
