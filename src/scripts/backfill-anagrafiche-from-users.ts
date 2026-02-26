import { getPayload } from 'payload'

import config from '@/payload.config'
import { ensureAnagraficaForCustomer } from '@/lib/anagrafiche/ensureAnagraficaForCustomer'

const payload = await getPayload({ config })

const DRY_RUN = process.env.DRY_RUN === 'true'
const LIMIT = Number.parseInt(process.env.LIMIT || '500', 10)

const result = await payload.find({
  collection: 'users',
  depth: 0,
  limit: Number.isFinite(LIMIT) ? LIMIT : 500,
  overrideAccess: true,
  where: {
    roles: {
      contains: 'customer',
    },
  },
})

let processed = 0
let createdOrUpdated = 0

for (const user of result.docs) {
  processed += 1
  if (DRY_RUN) {
    payload.logger.info({
      msg: 'DRY RUN backfill anagrafica',
      userID: user.id,
      email: user.email,
    })
    continue
  }

  await ensureAnagraficaForCustomer(payload, user as any)
  createdOrUpdated += 1
}

payload.logger.info({
  msg: 'Backfill anagrafiche completato',
  processed,
  createdOrUpdated,
  dryRun: DRY_RUN,
  totalDocs: result.totalDocs,
})

