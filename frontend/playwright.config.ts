import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config.js'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [ ['html', { open: 'never' }] ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // One-time login via Auth0 — saves session to tests/.auth/user.json
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },

    // Unauthenticated tests (public pages, auth redirects) — run on all three browsers
    {
      name: 'public-chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/chat.spec.ts', '**/journals.spec.ts', '**/global.setup.ts'],
    },
    {
      name: 'public-firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/chat.spec.ts', '**/journals.spec.ts', '**/global.setup.ts'],
    },
    {
      name: 'public-webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/chat.spec.ts', '**/journals.spec.ts', '**/global.setup.ts'],
    },

    // Authenticated tests — reuse the session cookie saved by the setup project
    {
      name: 'authenticated-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: ['**/chat.spec.ts', '**/journals.spec.ts'],
    },
    {
      name: 'authenticated-firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: ['**/chat.spec.ts', '**/journals.spec.ts'],
    },
    {
      name: 'authenticated-webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: ['**/chat.spec.ts', '**/journals.spec.ts'],
    },
  ],

  /* Start the dev server automatically before running E2E tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
