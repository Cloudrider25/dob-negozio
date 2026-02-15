import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'

const runId = Date.now()
const userEmail = `qa.account.journey.${runId}@example.com`
const userPassword = 'DobMilano!Journey123'

let payload: Payload
let userId: number | null = null

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
    await payload.delete({
      collection: 'orders',
      overrideAccess: true,
      where: {
        orderNumber: { contains: `TEST-A7-${runId}` },
      },
    })

    await payload.delete({
      collection: 'users',
      overrideAccess: true,
      where: {
        email: { equals: userEmail },
      },
    })
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
    expect(loginResponse.ok()).toBeTruthy()

    await page.goto('http://localhost:3000/it/account', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/it\/account/)

    await expect(page.getByRole('heading', { name: /ciao|hi|здравствуйте/i })).toBeVisible()
    await expect(page.getByText(userEmail)).toBeVisible()

    await page.getByRole('button', { name: /ordini|orders|заказы/i }).click()
    await expect(page.getByText(/TEST-A7-/i)).toBeVisible()

    await page.getByRole('button', { name: /indirizzi|addresses|адреса/i }).click()
    await expect(page.getByRole('button', { name: /aggiungi|add|добавить/i })).toBeVisible()
  })
})
