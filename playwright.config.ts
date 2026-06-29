import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5174';

export default defineConfig({
  testDir: './apps/photography/e2e',
  outputDir: './test-results/photography',
  fullyParallel: true,
  reporter: [['html', { outputFolder: 'playwright-report/photography', open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'edge-320',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 320, height: 900 },
      },
    },
    {
      name: 'edge-390',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 390, height: 900 },
      },
    },
    {
      name: 'edge-430',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 430, height: 900 },
      },
    },
    {
      name: 'edge-1440',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});
