import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { POST as checkoutPOST } from '../app/api/shop/checkout/route'
import { releaseOrderAllocation } from '../lib/shop/orderInventory'

const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

const findProductForTest = async (payload: Payload) => {
  const result = await payload.find({
    collection: 'products',
    overrideAccess: true,
    locale: 'it',
    depth: 0,
    limit: 1,
    where: {
      active: { equals: true },
    },
    select: {
      id: true,
      title: true,
      price: true,
      stock: true,
      allocatedStock: true,
      deliveries: true,
    },
  })

  return result.docs[0]
}

const main = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Keep this test non-destructive: we verify totals, then release allocation.
  process.env.SHOP_AUTO_CAPTURE = 'false'

  const product = await findProductForTest(payload)
  if (!product) {
    throw new Error('No active product with enough stock available for tamper test.')
  }

  const productID = Number(product.id)
  const unitPrice = asNumber(product.price)
  const quantity = 2
  if (!Number.isFinite(productID) || unitPrice <= 0) {
    throw new Error('Product test data invalid.')
  }

  const expectedTotal = unitPrice * quantity
  const allocatedBefore = asNumber(product.allocatedStock)
  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []

  await payload.update({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale: 'it',
    data: {
      deliveries: [
        ...deliveriesBefore,
        {
          lot: `qa-tamper-${Date.now()}`,
          quantity,
          costPerUnit: 1,
          deliveryDate: new Date().toISOString(),
        },
      ],
      allocatedStock: allocatedBefore,
    },
  })

  const body = JSON.stringify({
    locale: 'it',
    customer: {
      email: `qa+tamper-${Date.now()}@example.com`,
      firstName: 'QA',
      lastName: 'Tamper',
      address: 'Via Test 1',
      postalCode: '20100',
      city: 'Milano',
      province: 'MI',
      phone: '',
    },
    // Malicious client-side totals and prices: server must ignore these.
    subtotal: 0.01,
    total: 0.01,
    currency: 'USD',
    items: [
      {
        id: String(productID),
        quantity,
        unitPrice: 0.01,
        lineTotal: 0.01,
        currency: 'USD',
      },
    ],
  })

  let orderID: string | number | undefined
  try {
    const res = await checkoutPOST(
      new Request('http://localhost/api/shop/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      }),
    )

    const json = (await res.json()) as {
      ok?: boolean
      orderId?: number | string
      total?: number
      currency?: string
      error?: string
    }

    if (!res.ok || !json.ok || !json.orderId) {
      throw new Error(`Checkout failed during tamper test: ${JSON.stringify(json)}`)
    }
    orderID = json.orderId

    const returnedTotal = asNumber(json.total)
    if (returnedTotal !== expectedTotal) {
      throw new Error(
        `Tamper protection failed. expected total=${expectedTotal}, got total=${returnedTotal}`,
      )
    }

    const order = await payload.findByID({
      collection: 'orders',
      id: json.orderId,
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      select: {
        total: true,
        subtotal: true,
        currency: true,
        status: true,
        paymentStatus: true,
      },
    })

    if (asNumber(order.total) !== expectedTotal || order.currency !== 'EUR') {
      throw new Error(
        `Stored order does not match server truth. total=${order.total} currency=${order.currency}`,
      )
    }

    console.log('OK: Client-side price tampering ignored, server total enforced.')
    console.log({
      productID,
      expectedTotal,
      returnedTotal,
      storedTotal: order.total,
      storedCurrency: order.currency,
    })
  } finally {
    if (orderID) {
      await releaseOrderAllocation({
        payload,
        orderID: String(orderID),
        locale: 'it',
      })

      const orderItems = await payload.find({
        collection: 'order-items',
        overrideAccess: true,
        locale: 'it',
        depth: 0,
        where: {
          order: { equals: orderID },
        },
        limit: 200,
      })

      for (const item of orderItems.docs) {
        await payload.delete({
          collection: 'order-items',
          id: item.id,
          overrideAccess: true,
          locale: 'it',
        })
      }

      await payload.delete({
        collection: 'orders',
        id: orderID,
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
