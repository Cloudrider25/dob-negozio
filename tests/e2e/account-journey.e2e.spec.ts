import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'

const runId = Date.now()
const userEmail = `qa.account.journey.${runId}@example.com`
const userPassword = 'DobMilano!Journey123'

let payload: Payload
let userId: number | null = null
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

test.describe('Account journey', () => {
  test.beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const createdUser = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: userEmail,
        password: userPassword,
        roles: ['customer'],
        firstName: 'QA',
        lastName: 'Account',
        _verified: true,
      },
    })
    userId = createdUser.id

    await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber: `TEST-A7-${runId}`,
        status: 'paid',
        paymentStatus: 'paid',
        paymentProvider: 'manual',
        paymentReference: `test-a7-${runId}`,
        currency: 'EUR',
        locale: 'it',
        subtotal: 25,
        shippingAmount: 10,
        discountAmount: 0,
        total: 35,
        customerEmail: userEmail,
        customer: createdUser.id,
        customerFirstName: 'QA',
        customerLastName: 'Account',
        shippingAddress: {
          address: 'Via QA 1',
          postalCode: '20100',
          city: 'Milano',
          province: 'MI',
          country: 'Italy',
        },
      },
    })
  })

  test.afterAll(async () => {
    try {
      await payload.delete({
        collection: 'orders',
        overrideAccess: true,
        where: {
          orderNumber: { contains: `TEST-A7-${runId}` },
        },
      })
    } catch {
      // Cleanup best-effort: do not fail suite on teardown.
    }

    try {
      await payload.delete({
        collection: 'users',
        overrideAccess: true,
        where: {
          email: { equals: userEmail },
        },
      })
    } catch {
      // Cleanup best-effort: do not fail suite on teardown.
    }
  })

  test('anonymous user is redirected to signin from account', async ({ browser }) => {
    const anonymousContext = await browser.newContext()
    const anonymousPage = await anonymousContext.newPage()

    await anonymousPage.goto('http://localhost:3000/it/account', { waitUntil: 'networkidle' })
    await expect(anonymousPage).toHaveURL(/\/it\/signin/)

    await anonymousContext.close()
  })

  test('signin api -> account overview/orders/addresses works', async ({ page }) => {
    test.skip(!userId, 'Fixture user not available')

    await page.goto('http://localhost:3000/it/signin', { waitUntil: 'networkidle' })

    const loginResponse = await page.request.post('http://localhost:3000/api/users/login', {
      data: {
        email: userEmail,
        password: userPassword,
      },
    })
    const loginBody = (await loginResponse.json().catch(() => ({}))) as Record<string, unknown>
    expect(loginResponse.ok(), `status=${loginResponse.status()} body=${JSON.stringify(loginBody)}`).toBeTruthy()

    await page.context().addCookies(buildPreferenceCookies())

    await page.goto('http://localhost:3000/it/account', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/it\/account/)

    await expect(page.getByRole('heading', { name: /ciao|hi|здравствуйте/i })).toBeVisible()
    await expect(page.getByText(userEmail)).toBeVisible()

    await page.getByRole('button', { name: /prodotti|ordini|orders|заказы/i }).click()

    await page.getByRole('button', { name: /indirizzi|addresses|адреса/i }).click()
    await expect(
      page.getByRole('button', {
        name: /aggiungi|add|добавить|rubrica indirizzi|address book|адресная книга/i,
      }),
    ).toBeVisible()
  })
})
