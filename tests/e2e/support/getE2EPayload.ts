import { getPayload, type Payload } from 'payload'

import config from '../../../src/payload/config'

let payloadPromise: Promise<Payload> | null = null

export const getE2EPayload = async (): Promise<Payload> => {
  if (!payloadPromise) {
    payloadPromise = (async () => {
      const payloadConfig = await config
      return getPayload({ config: payloadConfig })
    })()
  }

  return payloadPromise
}
