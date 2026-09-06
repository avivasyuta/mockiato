import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '~': path.resolve(import.meta.dirname, 'src'),
            },
        },
    };
});
