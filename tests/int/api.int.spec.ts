import { getPayload, Payload } from 'payload'
import config from '@/payload/config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

const getPayloadWithRetry = async (retries = 3) => {
  let lastError: unknown
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const payloadConfig = await config
      return await getPayload({ config: payloadConfig })
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }
    }
  }
  throw lastError
}

describe('API', () => {
  beforeAll(async () => {
    payload = await getPayloadWithRetry(4)
  }, 60_000)

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
