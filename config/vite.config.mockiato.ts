import { defineConfig } from 'vite';

// bundling the content script using Vite
export default defineConfig({
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
