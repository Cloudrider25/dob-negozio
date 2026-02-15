import { expect, test } from '@playwright/test'

const hasSensitiveLeakage = (body: unknown) => {
  const text = typeof body === 'string' ? body : JSON.stringify(body || {})
  return /(stack|trace|select\s+|insert\s+|update\s+|delete\s+|postgres|drizzle|constraint|ECONN|node:)/i.test(
    text,
  )
}

test.describe('Account security', () => {
  test('forgot-password is rate-limited and returns sanitized payload', async ({ request }) => {
    let throttled = false
    let lastJson: unknown = null

    for (let i = 0; i < 8; i += 1) {
      const response = await request.post('http://localhost:3000/api/users/forgot-password', {
        data: {
          email: `qa-security-${Date.now()}@example.com`,
        },
      })

      const json = (await response.json().catch(() => ({}))) as unknown
      lastJson = json

      if (response.status() === 429) {
        throttled = true
        expect(hasSensitiveLeakage(json)).toBeFalsy()
        break
      }
    }

    expect(throttled, `Expected a 429 response. Last body: ${JSON.stringify(lastJson)}`).toBeTruthy()
  })

  test('auth failures do not expose technical internals', async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/users/login', {
      data: {
        email: 'not-existing-user@example.com',
        password: 'WrongPassword!123',
      },
    })
    const loginBody = (await loginResponse.json().catch(() => ({}))) as unknown

    expect(loginResponse.ok()).toBeFalsy()
    expect(hasSensitiveLeakage(loginBody)).toBeFalsy()

    const resetResponse = await request.post('http://localhost:3000/api/users/reset-password', {
      data: {
        token: 'invalid-token',
        password: 'DobMilano!Valid123',
      },
    })
    const resetBody = (await resetResponse.json().catch(() => ({}))) as unknown

    expect(resetResponse.ok()).toBeFalsy()
    expect(hasSensitiveLeakage(resetBody)).toBeFalsy()
  })
})
