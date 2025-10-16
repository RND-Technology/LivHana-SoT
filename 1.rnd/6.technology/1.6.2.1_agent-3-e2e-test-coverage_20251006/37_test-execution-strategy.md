### Test Execution Strategy

```yaml
# Playwright Config Update
# File: frontend/vibe-cockpit/playwright.config.ts

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],  // Fixed path conflict
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:5174',  // Fixed port (was 5173)
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Test groups for parallel execution
  testIgnore: process.env.TEST_SUITE
    ? `tests/e2e/${process.env.TEST_SUITE !== 'all' ? `!(${process.env.TEST_SUITE})` : ''}/**/*.spec.ts`
    : undefined,
});
```
