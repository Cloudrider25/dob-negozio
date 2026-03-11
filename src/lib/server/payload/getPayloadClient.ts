import { getPayload, type Payload } from 'payload'

import configPromise from '@/payload/config'

const MAX_RETRIES = 6
const BASE_RETRY_DELAY_MS = 500

let payloadClientPromise: Promise<Payload> | null = null

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown payload init error')

const createPayloadClient = async () => {
  let lastError: unknown = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await getPayload({ config: await configPromise })
    } catch (error) {
      lastError = toError(error)
      if (attempt < MAX_RETRIES) {
        await wait(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }
  throw toError(lastError)
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
    throw toError(error)
  }
}
