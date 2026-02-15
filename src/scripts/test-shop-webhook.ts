import crypto from 'node:crypto'

import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { POST as webhookPOST } from '../app/api/shop/webhook/route'

const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

const createOrderNumber = () => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `DOB-WEBHOOK-${y}${m}${d}-${random}`
}

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
      price: true,
      deliveries: true,
    },
  })

  return result.docs[0]
}

const main = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const secret = process.env.SHOP_WEBHOOK_SECRET?.trim() || 'dev-webhook-secret'
  process.env.SHOP_WEBHOOK_SECRET = secret

  const product = await findProductForTest(payload)
  if (!product) {
    throw new Error('No active product available for webhook test.')
  }

  const productID = Number(product.id)
  if (!Number.isFinite(productID)) {
    throw new Error('Product ID is not numeric, cannot run webhook test safely.')
  }

  const stockBefore = asNumber(product.stock)
  const allocatedBefore = asNumber(product.allocatedStock)
  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []
  const quantity = 1
  const unitPrice = typeof product.price === 'number' ? product.price : 10

  const prepared = await payload.update({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale: 'it',
    data: {
      deliveries: [
        ...deliveriesBefore,
        {
          lot: `qa-webhook-${Date.now()}`,
          quantity: 1,
          costPerUnit: 1,
          deliveryDate: new Date().toISOString(),
        },
      ],
      allocatedStock: allocatedBefore + quantity,
    },
  })

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    locale: 'it',
    draft: false,
    data: {
      orderNumber: createOrderNumber(),
      status: 'pending',
      paymentStatus: 'pending',
      paymentProvider: 'manual',
      paymentReference: `webhook-test-${Date.now()}`,
      inventoryCommitted: false,
      allocationReleased: false,
      currency: 'EUR',
      locale: 'it',
      subtotal: unitPrice * quantity,
      shippingAmount: 0,
      discountAmount: 0,
      total: unitPrice * quantity,
      customerEmail: 'alessio@dobmilano.com',
      customerFirstName: 'QA',
      customerLastName: 'Test',
      shippingAddress: {
        address: 'Via Test 1',
        postalCode: '20100',
        city: 'Milano',
        province: 'MI',
        country: 'Italy',
      },
    },
  })

  await payload.create({
    collection: 'order-items',
    overrideAccess: true,
    locale: 'it',
    draft: false,
    data: {
      order: order.id,
      product: productID,
      productTitle: product.title || `Product ${productID}`,
      currency: 'EUR',
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    },
  })

  const eventID = `evt-test-${Date.now()}`
  const body = JSON.stringify({
    eventID,
    provider: 'custom',
    type: 'payment.paid',
    locale: 'it',
    data: {
      orderID: order.id,
    },
  })
  const signature = sign(secret, body)

  const response = await webhookPOST(
    new Request('http://localhost/api/shop/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-shop-signature': signature,
      },
      body,
    }),
  )
  const first = (await response.json()) as { ok?: boolean; idempotent?: boolean; error?: string }
  if (!response.ok || !first.ok) {
    throw new Error(`First webhook call failed: ${JSON.stringify(first)}`)
  }

  const responseSecond = await webhookPOST(
    new Request('http://localhost/api/shop/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-shop-signature': signature,
      },
      body,
    }),
  )
  const second = (await responseSecond.json()) as {
    ok?: boolean
    idempotent?: boolean
    error?: string
  }
  if (!responseSecond.ok || !second.ok || !second.idempotent) {
    throw new Error(`Second webhook call not idempotent: ${JSON.stringify(second)}`)
  }

  const updatedOrder = await payload.findByID({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    locale: 'it',
    depth: 0,
    select: {
      status: true,
      paymentStatus: true,
      inventoryCommitted: true,
      allocationReleased: true,
    },
  })

  if (updatedOrder.status !== 'paid' || updatedOrder.paymentStatus !== 'paid') {
    throw new Error(
      `Order status not updated by webhook. status=${updatedOrder.status} paymentStatus=${updatedOrder.paymentStatus}`,
    )
  }
  if (!updatedOrder.inventoryCommitted) {
    throw new Error('Order inventoryCommitted flag not set.')
  }

  const updatedProduct = await payload.findByID({
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

  const expectedStock = stockBefore
  const expectedAllocated = allocatedBefore
  const stockNow = asNumber(updatedProduct.stock)
  const allocatedNow = asNumber(updatedProduct.allocatedStock)

  if (stockNow !== expectedStock || allocatedNow !== expectedAllocated) {
    throw new Error(
      `Inventory mismatch after webhook. expected stock=${expectedStock}, allocated=${expectedAllocated} got stock=${stockNow}, allocated=${allocatedNow}`,
    )
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

  console.log('OK: Webhook payment.paid processed with idempotency and inventory commit.')
  console.log({
    orderID: order.id,
    productID,
    status: updatedOrder.status,
    paymentStatus: updatedOrder.paymentStatus,
    inventoryCommitted: updatedOrder.inventoryCommitted,
    idempotentSecondCall: second.idempotent === true,
    stockBefore,
    allocatedBefore,
    stockAfter: stockNow,
    allocatedAfter: allocatedNow,
    preparedStock: asNumber(prepared.stock),
    preparedAllocated: asNumber(prepared.allocatedStock),
  })
}

await main()
