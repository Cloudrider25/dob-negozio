import { getPayload, type Payload } from 'payload'

import configPromise from '@/payload/config'

const MAX_RETRIES = 3
const BASE_RETRY_DELAY_MS = 300

let payloadClientPromise: Promise<Payload> | null = null

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const createPayloadClient = async () => {
  let lastError: unknown = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await getPayload({ config: await configPromise })
    } catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) {
        await wait(BASE_RETRY_DELAY_MS * attempt)
      }
    }
  }
  throw lastError
}

export const getPayloadClient = async () => {
  if (!payloadClientPromise) {
    payloadClientPromise = createPayloadClient()
  }

  try {
    return await payloadClientPromise
  } catch (error) {
    // Do not retain a failed client promise forever.
    payloadClientPromise = null
    throw error
  }
}
