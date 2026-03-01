import { expect, test, type Page } from '@playwright/test'

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

const fillRequiredFields = async (page: Page) => {
  await page.getByPlaceholder('Il tuo nome').fill('Mario')
  await page.getByPlaceholder('Il tuo cognome').fill('Rossi')
  await page.getByPlaceholder('email@esempio.com').fill('mario.rossi@example.com')
  await page.getByPlaceholder('+39 123 456 7890').fill('+39 333 1234567')
}

test.describe('Consultation form smoke', () => {
  test('@smoke submit success prevents duplicate request on rapid retry', async ({ page }) => {
    let submitHits = 0

    await page.route('**/api/consultation-leads', async (route) => {
      submitHits += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })

    await page.context().addCookies(buildPreferenceCookies())
    await page.goto('http://localhost:3000/it/services?view=consulenza', { waitUntil: 'networkidle' })
    await expect(page.getByPlaceholder('Il tuo nome')).toBeVisible()

    await fillRequiredFields(page)
    await page.getByRole('button', { name: 'Normale' }).click()

    const submitButton = page.getByRole('button', { name: /Invia Richiesta di Consulenza/i })
    await submitButton.click()
    await submitButton.click()

    await expect(
      page.getByText('Richiesta inviata con successo. Ti ricontatteremo entro 24 ore.'),
    ).toBeVisible()
    expect(submitHits).toBe(1)
  })

  test('@smoke keyboard navigation + mobile and desktop render + submit error', async ({ page }) => {
    await page.route('**/api/consultation-leads', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'forced-e2e-error' }),
      })
    })

    await page.context().addCookies(buildPreferenceCookies())

    for (const viewport of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport)
      await page.goto('http://localhost:3000/it/services?view=consulenza', { waitUntil: 'networkidle' })

      await expect(page.getByPlaceholder('Il tuo nome')).toBeVisible()
      await expect(page.getByRole('button', { name: /Invia Richiesta di Consulenza/i })).toBeVisible()
    }

    await fillRequiredFields(page)

    await page.getByPlaceholder('Il tuo nome').focus()
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('Il tuo cognome')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('email@esempio.com')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('+39 123 456 7890')).toBeFocused()

    await page.getByRole('button', { name: /Invia Richiesta di Consulenza/i }).click()
    await expect(
      page.getByText('Impossibile inviare la richiesta al momento. Riprova tra poco.'),
    ).toBeVisible()
  })
})
