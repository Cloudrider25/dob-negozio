import { getPayload, type Payload } from 'payload'

import config from '../../../src/payload/config'

let payloadPromise: Promise<Payload> | null = null

export const getE2EPayload = async (): Promise<Payload> => {
  if (!payloadPromise) {
    payloadPromise = (async () => {
      const payloadConfig = await config
      let lastError: unknown = null
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          return await getPayload({ config: payloadConfig })
        } catch (error) {
          lastError = error
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
            continue
          }
        }
      }
      throw lastError
    })()
  }

  return payloadPromise
}
