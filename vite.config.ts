import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    build: {
        assetsDir: '.',
        rollupOptions: {
            input: {
                app: 'src/index.tsx',
            },
            output: {
                entryFileNames: '[name].js',
                format: 'iife',
            },
        },
    },
    server: {
        open: true,
        host: 'localhost',
        port: 3000,
    },
});
