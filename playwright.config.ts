import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3100'
const mapboxToken = process.env.E2E_MAPBOX_ACCESS_TOKEN?.trim() ?? ''
const mapboxStyle = process.env.E2E_MAPBOX_STYLE_URL?.trim() ?? 'mapbox://styles/mapbox/standard'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3100',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SITE_URL: baseURL,
      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: mapboxToken,
      NEXT_PUBLIC_MAPBOX_STYLE_URL: mapboxStyle,
    },
  },
})
