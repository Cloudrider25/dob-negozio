import { expect, test } from '@playwright/test'
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

test.describe('Shop journey', () => {
  test('shop -> cart -> checkout -> confirmation', async ({ page, request }) => {
    test.setTimeout(120_000)

    console.log('[journey] resolve product')
    const product = await getCheckoutProduct()
    test.skip(!product, 'No active in-stock product found for checkout journey.')
    if (!product) return

    console.log('[journey] open shop')
    await page.goto('http://localhost:3000/it/shop', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/it\/shop/)

    console.log('[journey] seed cart from in-stock product', product.slug)
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

    console.log('[journey] open cart')
    await page.goto('http://localhost:3000/it/cart', { waitUntil: 'networkidle' })
    await expect(page.getByText('Riepilogo ordine')).toBeVisible()

    console.log('[journey] open checkout')
    await page.getByRole('link', { name: /Procedi al checkout/i }).click()
    await expect(page).toHaveURL(/\/it\/checkout$/)

    console.log('[journey] submit order')
    const checkoutResponse = await request.post('http://localhost:3000/api/shop/checkout', {
      data: {
        locale: 'it',
        customer: {
          email: 'qa.journey@example.com',
          firstName: 'QA',
          lastName: 'Journey',
          address: 'Via Test 1',
          postalCode: '20100',
          city: 'Milano',
          province: 'MI',
          phone: '',
        },
        items: [{ id: product.id, quantity: 1 }],
      },
    })

    const checkoutJson = (await checkoutResponse.json()) as {
      ok?: boolean
      error?: string
      orderNumber?: string
      orderId?: string | number
    }
    expect(checkoutResponse.ok(), JSON.stringify(checkoutJson)).toBeTruthy()
    expect(checkoutJson.ok, JSON.stringify(checkoutJson)).toBeTruthy()

    console.log('[journey] verify success')
    const order = checkoutJson.orderNumber || String(checkoutJson.orderId || '')
    await page.goto(`http://localhost:3000/it/checkout/success${order ? `?order=${encodeURIComponent(order)}` : ''}`)
    await expect(page).toHaveURL(/\/it\/checkout\/success/, { timeout: 20_000 })
    await expect(page.getByText('Grazie per il tuo acquisto')).toBeVisible()
    if (order) {
      await expect(page.getByText(/Riferimento ordine:/i)).toBeVisible()
    }
  })
})
