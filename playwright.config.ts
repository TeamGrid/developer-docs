import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.035,
    },
  },
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 1 : 0,
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  testDir: './tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:4323',
    channel: 'chrome',
    colorScheme: 'light',
    locale: 'en-US',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4323',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:4323',
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { height: 900, width: 1440 } },
    },
    {
      name: 'mobile',
      use: { viewport: { height: 844, width: 390 } },
    },
  ],
})
