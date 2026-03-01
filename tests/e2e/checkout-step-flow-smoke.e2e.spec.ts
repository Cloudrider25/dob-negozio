import { expect, test, type Page } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'

type CheckoutProduct = {
  id: string
  title: string
  price: number
  currency?: string
  brand?: string
  coverImage?: string | null
  slug: string
}

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

const getCheckoutProduct = async (): Promise<CheckoutProduct | null> => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const result = await payload.find({
    collection: 'products',
    overrideAccess: true,
    locale: 'it',
    depth: 0,
    limit: 60,
    where: {
      active: { equals: true },
    },
  })

  const product = result.docs.find((item) => {
    const stock = typeof item.stock === 'number' ? item.stock : 0
    const allocated = typeof item.allocatedStock === 'number' ? item.allocatedStock : 0
    return Boolean(item.slug) && typeof item.price === 'number' && item.price > 0 && stock - allocated > 0
  })
  if (!product?.slug || typeof product.price !== 'number') return null

  const brand =
    product.brand && typeof product.brand === 'object' && 'name' in product.brand
      ? String((product.brand as { name?: unknown }).name ?? '')
      : undefined

  const coverImage =
    product.coverImage && typeof product.coverImage === 'object' && 'url' in product.coverImage
      ? String((product.coverImage as { url?: unknown }).url ?? '') || null
      : null

  return {
    id: String(product.id),
    title: product.title || product.slug,
    price: product.price,
    currency: 'EUR',
    brand,
    coverImage,
    slug: product.slug,
  }
}

const seedCart = async (page: Page, product: CheckoutProduct) => {
  await page.evaluate((item) => {
    window.localStorage.setItem(
      'dob:cart',
      JSON.stringify([
        {
          id: item.id,
          title: item.title,
          slug: item.slug,
          price: item.price,
          currency: item.currency || 'EUR',
          brand: item.brand || '',
          coverImage: item.coverImage || null,
          quantity: 1,
        },
      ]),
    )
    window.dispatchEvent(new Event('dob:cart-updated'))
  }, product)
}

const fillCheckoutInformationStep = async (page: Page) => {
  const email = page.locator('input[placeholder=\"Email\"]')
  const firstName = page.locator('input[placeholder=\"Nome\"]')
  const lastName = page.locator('input[placeholder=\"Cognome\"]')
  const address = page.locator('input[placeholder=\"Indirizzo\"]')
  const postalCode = page.locator('input[placeholder=\"CAP\"]')
  const city = page.locator('input[placeholder=\"Città\"]')
  const province = page.locator('input[placeholder=\"Provincia\"]')

  await email.fill('qa.checkout.ui@example.com')
  await firstName.fill('QA')
  await lastName.fill('Checkout')
  await address.fill('Via Test 1')
  await postalCode.fill('20100')
  await city.fill('Milano')
  await province.fill('MI')

  await expect(email).toHaveValue('qa.checkout.ui@example.com')
  await expect(firstName).toHaveValue('QA')
  await expect(lastName).toHaveValue('Checkout')
  await expect(address).toHaveValue('Via Test 1')
  await expect(postalCode).toHaveValue('20100')
  await expect(city).toHaveValue('Milano')
  await expect(province).toHaveValue('MI')

  // Allow React state updates derived from onChange handlers to settle before step transition.
  await page.waitForTimeout(300)
}

test.describe('Checkout step flow smoke', () => {
  // Scope intentionally limited to information step stability.
  // Full contact->shipping->payment flow remains tracked in refactor monitor.
  test('@smoke desktop information step render and interactions', async ({ page }) => {
    test.setTimeout(120_000)

    const product = await getCheckoutProduct()
    test.skip(!product, 'No active in-stock product found for checkout step smoke.')
    if (!product) return

    await page.context().addCookies(buildPreferenceCookies())
    await page.setViewportSize({ width: 1440, height: 960 })

    await page.goto('http://localhost:3000/it', { waitUntil: 'domcontentloaded' })
    await seedCart(page, product)
    await page.goto('http://localhost:3000/it/checkout', { waitUntil: 'domcontentloaded' })

    await fillCheckoutInformationStep(page)
    await expect(page.getByRole('button', { name: 'Vai alla spedizione' })).toBeEnabled({ timeout: 30_000 })
    await expect(page.getByText('Subtotale')).toBeVisible()
  })

  test('@smoke mobile information step render and interactions', async ({ page }) => {
    test.setTimeout(120_000)

    const product = await getCheckoutProduct()
    test.skip(!product, 'No active in-stock product found for checkout step smoke.')
    if (!product) return

    await page.context().addCookies(buildPreferenceCookies())
    await page.setViewportSize({ width: 390, height: 844 })

    await page.goto('http://localhost:3000/it', { waitUntil: 'domcontentloaded' })
    await seedCart(page, product)
    await page.goto('http://localhost:3000/it/checkout', { waitUntil: 'domcontentloaded' })

    await fillCheckoutInformationStep(page)
    await expect(page.getByRole('button', { name: 'Vai alla spedizione' })).toBeEnabled({ timeout: 30_000 })
    await expect(page.getByText('Subtotale')).toHaveCount(0)
  })

  test('@smoke desktop shipping -> payment deterministic step entry', async ({ page }) => {
    test.setTimeout(120_000)

    const product = await getCheckoutProduct()
    test.skip(!product, 'No active in-stock product found for checkout step smoke.')
    if (!product) return

    await page.context().addCookies(buildPreferenceCookies())
    await page.setViewportSize({ width: 1440, height: 960 })

    await page.goto('http://localhost:3000/it', { waitUntil: 'domcontentloaded' })
    await seedCart(page, product)
    await page.goto('http://localhost:3000/it/checkout?e2eStep=shipping', {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.getByRole('heading', { name: 'Metodo di spedizione' })).toBeVisible({
      timeout: 15_000,
    })

    await page.getByRole('button', { name: 'Ritiro in negozio' }).click()
    await page.getByRole('button', { name: 'Continua al pagamento' }).click()
    await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible({ timeout: 15_000 })
  })
})
