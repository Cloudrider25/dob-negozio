import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const isCI = Boolean(process.env.CI)
const localHost = '127.0.0.1'
const localPort = 3000
const baseURL = `http://${localHost}:${localPort}`

export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: isCI
      ? `cross-env NODE_OPTIONS=--no-deprecation pnpm exec next start --hostname ${localHost} --port ${localPort}`
      : `cross-env NODE_OPTIONS=--no-deprecation NEXT_DIST_DIR=.next-dev WATCHPACK_POLLING=true pnpm exec next dev --hostname ${localHost} --port ${localPort}`,
    reuseExistingServer: !isCI,
    url: `${baseURL}/it/signin`,
    timeout: isCI ? 180000 : 60000,
  },
})
