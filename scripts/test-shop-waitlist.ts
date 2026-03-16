import { getPayload, type Payload } from 'payload'

import config from '../src/payload/config'

const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const asString = (value: unknown) => (typeof value === 'string' ? value : '')

const findProductForTest = async (payload: Payload) => {
  const result = await payload.find({
    collection: 'products',
    overrideAccess: true,
    locale: 'it',
    depth: 1,
    limit: 10,
    where: {
      active: { equals: true },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      brand: true,
      deliveries: true,
      allocatedStock: true,
      stock: true,
    },
  })

  return result.docs.find((item) => Number.isFinite(Number(item.id)) && asString(item.slug).trim().length > 0)
}

const findCustomerForTest = async (payload: Payload) => {
  const result = await payload.find({
    collection: 'users',
    overrideAccess: true,
    depth: 0,
    limit: 20,
    where: {
      roles: { contains: 'customer' },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      preferences: true,
    },
  })

  return result.docs.find((user) => typeof user.id === 'number' && asString(user.email).includes('@'))
}

const main = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const product = await findProductForTest(payload)
  if (!product) throw new Error('No active product available for waitlist test.')

  const customer = await findCustomerForTest(payload)
  if (!customer) throw new Error('No customer user available for waitlist test.')

  const productID = Number(product.id)
  const customerID = Number(customer.id)
  if (!Number.isFinite(productID) || !Number.isFinite(customerID)) {
    throw new Error('Invalid test identifiers for waitlist test.')
  }

  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []
  const allocatedBefore = asNumber(product.allocatedStock)
  const stockBefore = asNumber(product.stock)

  const existing = await payload.find({
    collection: 'product-waitlists',
    overrideAccess: true,
    locale: 'it',
    depth: 0,
    limit: 100,
    where: {
      and: [
        { customer: { equals: customerID } },
        { product: { equals: productID } },
      ],
    },
  })

  try {
    for (const row of existing.docs) {
      await payload.delete({
        collection: 'product-waitlists',
        id: row.id,
        overrideAccess: true,
        locale: 'it',
      })
    }

    const prepared = await payload.update({
      collection: 'products',
      id: productID,
      overrideAccess: true,
      locale: 'it',
      data: {
        deliveries: [
          {
            lot: `qa-waitlist-${Date.now()}`,
            quantity: 1,
            costPerUnit: 1,
            deliveryDate: new Date().toISOString(),
          },
        ],
        allocatedStock: 1,
      },
    })

    if (asNumber(prepared.stock) !== 1 || asNumber(prepared.allocatedStock) !== 1) {
      throw new Error(
        `Waitlist setup failed. expected stock/allocated 1/1, got ${asNumber(prepared.stock)}/${asNumber(prepared.allocatedStock)}`,
      )
    }

    const created = await payload.create({
      collection: 'product-waitlists',
      overrideAccess: true,
      locale: 'it',
      data: {
        customer: customerID,
        product: productID,
        locale: 'it',
        status: 'active',
        customerEmail: asString(customer.email),
        customerFirstName: asString(customer.firstName),
        customerLastName: asString(customer.lastName),
        productTitle: asString(product.title) || asString(product.slug) || `Prodotto ${productID}`,
        productSlug: asString(product.slug),
        productBrand:
          product.brand && typeof product.brand === 'object' && 'name' in product.brand
            ? asString((product.brand as { name?: unknown }).name)
            : '',
      },
    })

    if (created.status !== 'active') {
      throw new Error(`Expected active waitlist entry, got ${String(created.status)}`)
    }

    await payload.update({
      collection: 'products',
      id: productID,
      overrideAccess: true,
      locale: 'it',
      data: {
        deliveries: [
          {
            lot: `qa-waitlist-${Date.now()}-back`,
            quantity: 1,
            costPerUnit: 1,
            deliveryDate: new Date().toISOString(),
          },
        ],
        allocatedStock: 0,
      },
    })

    const updated = await payload.findByID({
      collection: 'product-waitlists',
      id: created.id,
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      select: {
        status: true,
        notifiedAt: true,
        lastAvailabilityAt: true,
        notificationError: true,
      },
    })

    if (updated.status !== 'notified') {
      throw new Error(
        `Expected waitlist status notified after stock recovery, got ${String(updated.status)} (${String(updated.notificationError || '')})`,
      )
    }

    if (!asString(updated.notifiedAt) || !asString(updated.lastAvailabilityAt)) {
      throw new Error('Waitlist notification timestamps missing after stock recovery.')
    }

    console.log('OK: Waitlist entry notified when product returns available.')
    console.log({
      productID,
      customerID,
      stockBefore,
      allocatedBefore,
      notifiedAt: updated.notifiedAt,
      lastAvailabilityAt: updated.lastAvailabilityAt,
    })
  } finally {
    const rows = await payload.find({
      collection: 'product-waitlists',
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      limit: 100,
      where: {
        and: [
          { customer: { equals: customerID } },
          { product: { equals: productID } },
        ],
      },
    })

    for (const row of rows.docs) {
      await payload.delete({
        collection: 'product-waitlists',
        id: row.id,
        overrideAccess: true,
        locale: 'it',
      })
    }

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
}

await main()
