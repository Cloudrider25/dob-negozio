import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('@smoke can go on homepage', async ({ page }) => {
    await page.goto('/it', { waitUntil: 'domcontentloaded' })

    await expect(page).toHaveTitle(/DOB/i)
    await expect(page.locator('body')).toContainText('DOB')
  })
})
