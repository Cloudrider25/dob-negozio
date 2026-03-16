import { getPayload } from 'payload'

import config from '../src/payload/config'
import type { Product } from '../src/payload/generated/payload-types'

const FIXTURE_EMAIL = 'qa.waitlist.ui@example.com'

const main = async () => {
  const payload = await getPayload({ config: await config })
  const productIdArg = process.argv[2]
  const allocatedBeforeArg = process.argv[3]
  const deliveriesBeforeArg = process.argv[4]

  const productID =
    typeof productIdArg === 'string' && productIdArg.trim() && !Number.isNaN(Number(productIdArg))
      ? Number(productIdArg)
      : NaN
  const allocatedBefore =
    typeof allocatedBeforeArg === 'string' && allocatedBeforeArg.trim() && !Number.isNaN(Number(allocatedBeforeArg))
      ? Number(allocatedBeforeArg)
      : 0
  const deliveriesBefore: Product['deliveries'] =
    typeof deliveriesBeforeArg === 'string' && deliveriesBeforeArg.trim()
      ? (JSON.parse(deliveriesBeforeArg) as Product['deliveries'])
      : []

  const users = await payload.find({
    collection: 'users',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      email: { equals: FIXTURE_EMAIL },
    },
  })

  const user = users.docs[0]

  if (user?.id) {
    const waitlists = await payload.find({
      collection: 'product-waitlists',
      overrideAccess: true,
      depth: 0,
      limit: 200,
      where: {
        customer: { equals: user.id },
      },
    })

    for (const entry of waitlists.docs) {
      await payload.delete({
        collection: 'product-waitlists',
        id: entry.id,
        overrideAccess: true,
      })
    }
  }

  if (Number.isFinite(productID)) {
    await payload.update({
      collection: 'products',
      id: productID,
      overrideAccess: true,
      locale: 'it',
      data: {
        deliveries: deliveriesBefore,
        allocatedStock: allocatedBefore,
      },
    })
  }

  console.log('OK: UI waitlist fixture cleaned up.')
}

await main()
