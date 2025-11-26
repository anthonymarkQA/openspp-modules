import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for OpenSPP E2E tests
 * Assumes OpenSPP is running locally on http://localhost:8069
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000, // 1 minute global timeout
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: process.env.OPENSPP_URL || 'http://localhost:8069',
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false,
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: false,
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: false,
      },
    },
  ],

  webServer: {
    command: 'echo "Ensure OpenSPP is running on http://localhost:8069"',
    url: process.env.OPENSPP_URL || 'http://localhost:8069',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
