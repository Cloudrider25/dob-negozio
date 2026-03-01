import crypto from 'node:crypto'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { POST as checkoutPOST } from '../app/api/shop/checkout/route'
import { POST as webhookPOST } from '../app/api/shop/webhook/route'

const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const sign = (secret: string, body: string) =>
  crypto.createHmac('sha256', secret).update(body).digest('hex')

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
      stock: true,
      allocatedStock: true,
      deliveries: true,
      price: true,
    },
  })
  return result.docs[0]
}

const main = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const secret = process.env.SHOP_WEBHOOK_SECRET?.trim() || 'dev-webhook-secret'
  process.env.SHOP_WEBHOOK_SECRET = secret
  process.env.SHOP_AUTO_CAPTURE = 'false'

  const product = await findProductForTest(payload)
  if (!product) throw new Error('No active product available for failed payment test.')

  const productID = Number(product.id)
  if (!Number.isFinite(productID)) throw new Error('Product ID must be numeric for test.')

  const stockBefore = asNumber(product.stock)
  const allocatedBefore = asNumber(product.allocatedStock)
  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []
  let expectedStockAfterSetup = stockBefore
  let orderID: string | number | undefined

  // Ensure at least one unit can be allocated.
  const prepared = await payload.update({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale: 'it',
    data: {
      deliveries: [
        ...deliveriesBefore,
        {
          lot: `qa-failed-${Date.now()}`,
          quantity: 1,
          costPerUnit: 1,
          deliveryDate: new Date().toISOString(),
        },
      ],
      allocatedStock: allocatedBefore,
    },
  })
  expectedStockAfterSetup = asNumber(prepared.stock)

  let stockAfterFail = 0
  let allocatedAfterFail = 0

  try {
    const checkoutRes = await checkoutPOST(
      new Request('http://localhost/api/shop/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale: 'it',
          customer: {
            email: `qa+failed-${Date.now()}@example.com`,
            firstName: 'QA',
            lastName: 'Failed',
            address: 'Via Test 1',
            postalCode: '20100',
            city: 'Milano',
            province: 'MI',
            phone: '',
          },
          items: [{ id: String(productID), quantity: 1 }],
        }),
      }),
    )
    const checkoutJson = (await checkoutRes.json()) as {
      ok?: boolean
      orderId?: string | number
      status?: string
      error?: string
    }
    if (!checkoutRes.ok || !checkoutJson.ok || !checkoutJson.orderId) {
      throw new Error(`Checkout setup failed: ${JSON.stringify(checkoutJson)}`)
    }
    if (checkoutJson.status !== 'pending') {
      throw new Error(`Expected pending status with SHOP_AUTO_CAPTURE=false, got ${checkoutJson.status}`)
    }
    orderID = checkoutJson.orderId

    const productAfterCheckout = await payload.findByID({
      collection: 'products',
      id: productID,
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      select: {
        allocatedStock: true,
      },
    })
    const allocatedAfterCheckout = asNumber(productAfterCheckout.allocatedStock)
    if (allocatedAfterCheckout !== allocatedBefore + 1) {
      throw new Error(
        `Allocation after checkout mismatch. expected ${allocatedBefore + 1}, got ${allocatedAfterCheckout}`,
      )
    }

    const webhookBody = JSON.stringify({
      eventID: `evt-failed-${Date.now()}`,
      provider: 'custom',
      type: 'payment.failed',
      locale: 'it',
      data: {
        orderID,
      },
    })
    const signature = sign(secret, webhookBody)

    const webhookRes = await webhookPOST(
      new Request('http://localhost/api/shop/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-shop-signature': signature,
        },
        body: webhookBody,
      }),
    )
    const webhookJson = (await webhookRes.json()) as { ok?: boolean; error?: string }
    if (!webhookRes.ok || !webhookJson.ok) {
      throw new Error(`payment.failed webhook failed: ${JSON.stringify(webhookJson)}`)
    }

    const orderAfterFail = await payload.findByID({
      collection: 'orders',
      id: orderID,
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      select: {
        status: true,
        paymentStatus: true,
        allocationReleased: true,
        inventoryCommitted: true,
      },
    })

    if (
      orderAfterFail.status !== 'failed' ||
      orderAfterFail.paymentStatus !== 'failed' ||
      !orderAfterFail.allocationReleased
    ) {
      throw new Error(
        `Order status mismatch after payment.failed: ${JSON.stringify({
          status: orderAfterFail.status,
          paymentStatus: orderAfterFail.paymentStatus,
          allocationReleased: orderAfterFail.allocationReleased,
          inventoryCommitted: orderAfterFail.inventoryCommitted,
        })}`,
      )
    }

    const productAfterFail = await payload.findByID({
      collection: 'products',
      id: productID,
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      select: {
        stock: true,
        allocatedStock: true,
      },
    })
    stockAfterFail = asNumber(productAfterFail.stock)
    allocatedAfterFail = asNumber(productAfterFail.allocatedStock)

    if (stockAfterFail !== expectedStockAfterSetup || allocatedAfterFail !== allocatedBefore) {
      throw new Error(
        `Inventory recovery mismatch after payment.failed. expected stock/allocated ${expectedStockAfterSetup}/${allocatedBefore} got ${stockAfterFail}/${allocatedAfterFail}`,
      )
    }

    console.log('OK: payment.failed recovery validated (order failed + allocation released).')
    console.log({
      productID,
      orderID,
      stockBefore,
      allocatedBefore,
      stockAfterFail,
      allocatedAfterFail,
    })
  } finally {
    if (orderID) {
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
