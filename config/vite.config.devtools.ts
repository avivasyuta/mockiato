import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// bundling the devtools script using Vite
export default defineConfig({
    plugins: [tsconfigPaths()],
    build: {
        outDir: 'dist',
        cssCodeSplit: false,
        emptyOutDir: false,
        lib: {
            entry: 'src/scripts/devtools.ts',
            name: 'mockiato',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                entryFileNames: 'devtools.js',
            },
        },
    },
});
