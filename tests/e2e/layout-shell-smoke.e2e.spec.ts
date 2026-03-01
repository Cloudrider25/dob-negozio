import { expect, test } from '@playwright/test'

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

test.describe('Layout shell smoke', () => {
  test('@smoke mobile menu + preferences + search drawer', async ({ page }) => {
    await page.context().addCookies(buildPreferenceCookies())
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(HOME_URL, { waitUntil: 'networkidle' })

    await page.locator('label[aria-label="Apri menu"]').click()
    const menuOverlay = page.locator('div[class*="Header_menuOverlay"]').first()
    await expect(menuOverlay.getByRole('link', { name: /get directions/i })).toBeVisible()

    await menuOverlay.getByRole('button', { name: /€|eur/i }).first().click()
    const preferencesDialog = page.getByRole('dialog')
    await expect(preferencesDialog).toBeVisible()
    await expect(
      preferencesDialog.getByRole('heading', { name: /impostazioni rilevate automaticamente|location detected automatically/i }),
    ).toBeVisible()

    await preferencesDialog.getByRole('button', { name: /cambia paese|change country/i }).click()
    await expect(preferencesDialog.getByRole('button', { name: 'IT', exact: true })).toBeVisible()

    await preferencesDialog.getByRole('button', { name: /continua con eur|continue with eur/i }).click()
    await expect(preferencesDialog).toBeHidden()

    await page.locator('label[aria-label="Apri menu"]').click()

    await page.getByRole('button', { name: 'Search' }).click()
    const drawer = page.locator('aside[aria-label="Search drawer"]')
    const backdrop = drawer.locator('xpath=preceding-sibling::div[1]')
    const searchInput = drawer.locator('input').first()
    await expect(searchInput).toBeVisible()
    await searchInput.fill('kit')
    await drawer.locator('button').first().click()
    await expect(backdrop).toHaveAttribute('aria-hidden', 'true')
  })

  test('@smoke desktop search drawer open/close', async ({ page }) => {
    await page.context().addCookies(buildPreferenceCookies())
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto(HOME_URL, { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: 'Search' }).click()
    const drawer = page.locator('aside[aria-label="Search drawer"]')
    const backdrop = drawer.locator('xpath=preceding-sibling::div[1]')
    const searchInput = drawer.locator('input').first()
    await expect(searchInput).toBeVisible()
    await drawer.locator('button').first().click()
    await expect(backdrop).toHaveAttribute('aria-hidden', 'true')
  })
})
