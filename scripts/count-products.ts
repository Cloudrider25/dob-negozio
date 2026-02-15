import 'dotenv/config'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

const run = async () => {
  const payload = await getPayload({ config: await configPromise })
  const res = await payload.find({ collection: 'products', limit: 0, overrideAccess: true })
  // eslint-disable-next-line no-console
  console.log(`Products count: ${res.totalDocs}`)
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
