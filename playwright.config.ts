import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }], // mobile-first
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  webServer: {
    command: 'npm run start', // requiere `npm run build` previo (CI lo garantiza — Task 7)
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
