import { expect, test, type Page } from '@playwright/test'

const HOME_URL = 'http://localhost:3000/it'
const oneYearSeconds = 60 * 60 * 24 * 365

const buildPreferenceCookies = () => [
  {
    name: 'dob_prefs_confirmed',
    value: '1',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_locale',
    value: 'it',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_country',
    value: 'ITA',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_currency',
    value: 'EUR',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
]

const expectHeroCtas = async (page: Page) => {
  const mainHero = page.locator('[data-hero="true"]').first()
  await expect(mainHero).toBeVisible()

  const mainHeroLinks = mainHero.getByRole('link')
  await expect(mainHeroLinks.first()).toBeVisible()

  const storyHero = page.locator('section[aria-label="Story highlight"]').first()
  await expect(storyHero).toBeVisible()

  const storyHeroCta = storyHero.getByRole('link').first()
  await expect(storyHeroCta).toBeVisible()

  const href = await storyHeroCta.getAttribute('href')
  expect(href).toBeTruthy()
  expect(href?.startsWith('/it/')).toBeTruthy()
}

test.describe('Heroes smoke', () => {
  test('@smoke desktop + mobile render and CTA visibility', async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 960 },
      { width: 390, height: 844 },
    ]) {
      await page.context().addCookies(buildPreferenceCookies())
      await page.setViewportSize(viewport)
      await page.goto(HOME_URL, { waitUntil: 'networkidle' })

      await expectHeroCtas(page)
    }
  })
})
