import * as path from 'path';
import react from '@vitejs/plugin-react';
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '~': path.resolve(__dirname, 'src'),
            },
        },
    };
});
