import { expect, test } from '@playwright/test'
import type { Payload } from 'payload'

import { getE2EPayload } from './support/getE2EPayload'

const runId = Date.now()
const userEmail = `qa.account.login.${runId}@example.com`
const userPassword = 'DobMilano!Login123'

let payload: Payload
let userId: number | null = null

test.describe('Account login smoke', () => {
  test.beforeAll(async () => {
    test.setTimeout(120_000)
    payload = await getE2EPayload()
    const createdUser = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: userEmail,
        password: userPassword,
        roles: ['customer'],
        firstName: 'QA',
        lastName: 'Login',
        _verified: true,
      },
    })
    userId = createdUser.id
  })

  test.afterAll(async () => {
    if (!userId) return
    await payload
      .delete({
        collection: 'users',
        id: userId,
        overrideAccess: true,
      })
      .catch(() => undefined)
  })

  test('@smoke user can login and open account', async ({ page }) => {
    test.setTimeout(60_000)

    await page.goto('http://localhost:3000/it/signin', { waitUntil: 'domcontentloaded' })

    const loginResponse = await page.request.post('http://localhost:3000/api/users/login', {
      data: {
        email: userEmail,
        password: userPassword,
      },
    })
    expect(loginResponse.ok()).toBeTruthy()

    await page.goto('http://localhost:3000/it/account', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/it\/account/)
  })
})
