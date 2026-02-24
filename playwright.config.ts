import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Raadhya Ethnica E2E tests.
 * Dev server must be running on http://localhost:3000 before running.
 * Run: npx playwright test
 */
export default defineConfig({
    testDir: './src/__tests__/e2e',
    /* Run tests in parallel */
    fullyParallel: true,
    /* Fail the build on CI if test.only is left */
    forbidOnly: !!process.env.CI,
    /* Retry on CI */
    retries: process.env.CI ? 2 : 0,
    /* Limit workers on CI */
    workers: process.env.CI ? 1 : undefined,
    /* HTML report */
    reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

    use: {
        /* Base URL – assumes Next.js dev server */
        baseURL: 'http://localhost:3000',
        /* Collect trace on first retry */
        trace: 'on-first-retry',
        /* Take screenshots on failure */
        screenshot: 'only-on-failure',
        /* Viewport */
        viewport: { width: 1280, height: 720 },
    },

    /* Only run Chromium locally for speed */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
