import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SMOKE_BASE_URL ?? 'https://task-flow-ashy-nu.vercel.app';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
