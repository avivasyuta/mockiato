import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        headless: true,
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Load the extension
                launchOptions: {
                    args: [
                        `--disable-extensions-except=${path.join(process.cwd(), 'dist')}`,
                        `--load-extension=${path.join(process.cwd(), 'dist')}`,
                    ],
                },
            },
        },
    ],
    webServer: {
        command: 'pnpm run build && python3 -m http.server 3000 --directory .',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
