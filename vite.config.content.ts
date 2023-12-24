import { defineConfig } from 'vite';

// bundling the content script using Vite
export default defineConfig({
    build: {
        outDir: 'dist',
        cssCodeSplit: false,
        emptyOutDir: false,
        lib: {
            entry: 'src/scripts/contentScript.ts',
            name: 'mockiato',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                entryFileNames: 'contentScript.js',
            },
        },
    },
});
