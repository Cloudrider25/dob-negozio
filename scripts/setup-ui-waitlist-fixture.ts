import { getPayload } from 'payload'

import config from '../src/payload/config'

const FIXTURE_EMAIL = 'qa.waitlist.ui@example.com'
const FIXTURE_PASSWORD = 'Waitlist123!'
const FIXTURE_LOT = 'qa-ui-waitlist'

const main = async () => {
  const payload = await getPayload({ config: await config })

  const products = await payload.find({
    collection: 'products',
    overrideAccess: true,
    locale: 'it',
    depth: 1,
    limit: 20,
    where: {
      active: { equals: true },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      deliveries: true,
      allocatedStock: true,
      stock: true,
    },
  })

  const product = products.docs.find((item) => typeof item.slug === 'string' && item.slug.trim().length > 0)
  if (!product) throw new Error('No active product found for UI waitlist fixture.')

  const existingUsers = await payload.find({
    collection: 'users',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      email: { equals: FIXTURE_EMAIL },
    },
    select: {
      id: true,
      email: true,
    },
  })

  const user =
    existingUsers.docs[0] ||
    (await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: FIXTURE_EMAIL,
        password: FIXTURE_PASSWORD,
        roles: ['customer'],
        firstName: 'QA',
        lastName: 'Waitlist',
        _verified: true,
        preferences: {
          preferredLocale: 'it',
          marketingOptIn: false,
        },
      },
    }))

  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []
  const allocatedBefore = typeof product.allocatedStock === 'number' ? product.allocatedStock : 0
  const stockBefore = typeof product.stock === 'number' ? product.stock : 0

  await payload.update({
    collection: 'products',
    id: product.id,
    overrideAccess: true,
    locale: 'it',
    data: {
      deliveries: [
        {
          lot: FIXTURE_LOT,
          quantity: 1,
          costPerUnit: 1,
          deliveryDate: new Date().toISOString(),
        },
      ],
      allocatedStock: 1,
    },
  })

  console.log(
    JSON.stringify({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      userId: user.id,
      email: FIXTURE_EMAIL,
      password: FIXTURE_PASSWORD,
      cleanup: {
        deliveriesBefore,
        allocatedBefore,
        stockBefore,
      },
    }),
  )
}

await main()
