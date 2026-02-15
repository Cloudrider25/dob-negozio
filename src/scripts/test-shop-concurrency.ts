import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { POST as checkoutPOST } from '../app/api/shop/checkout/route'

const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const asString = (value: unknown) => (typeof value === 'string' ? value : '')

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

const requestPayload = (productID: number, suffix: string) => ({
  locale: 'it',
  customer: {
    email: `qa+${suffix}@example.com`,
    firstName: 'QA',
    lastName: 'Concurrent',
    address: 'Via Test 1',
    postalCode: '20100',
    city: 'Milano',
    province: 'MI',
    phone: '',
  },
  items: [{ id: String(productID), quantity: 1 }],
})

const main = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  process.env.SHOP_AUTO_CAPTURE = 'true'

  const product = await findProductForTest(payload)
  if (!product) {
    throw new Error('No active product available for concurrency test.')
  }

  const productID = Number(product.id)
  if (!Number.isFinite(productID)) {
    throw new Error('Product ID is not numeric, cannot run concurrency test safely.')
  }

  const stockBefore = asNumber(product.stock)
  const allocatedBefore = asNumber(product.allocatedStock)
  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []

  await payload.update({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale: 'it',
    data: {
      deliveries: [
        {
          lot: `qa-concurrency-${Date.now()}`,
          quantity: 1,
          costPerUnit: 1,
          deliveryDate: new Date().toISOString(),
        },
      ],
      allocatedStock: 0,
    },
  })

  const runCheckout = async (suffix: string) => {
    const body = JSON.stringify(requestPayload(productID, suffix))
    const res = await checkoutPOST(
      new Request('http://localhost/api/shop/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body,
      }),
    )
    const json = (await res.json()) as Record<string, unknown>
    return {
      ok: res.ok,
      status: res.status,
      body: json,
      orderId: json.orderId,
    }
  }

  const [first, second] = await Promise.all([runCheckout('a'), runCheckout('b')])
  const results = [first, second]

  const successes = results.filter((item) => item.ok)
  const failures = results.filter((item) => !item.ok)

  if (successes.length !== 1 || failures.length !== 1) {
    throw new Error(`Expected exactly 1 success and 1 failure, got: ${JSON.stringify(results)}`)
  }

  const failureMessage = asString(failures[0]?.body?.error)
  if (!failureMessage.toLowerCase().includes('disponibilit')) {
    throw new Error(`Expected stock availability failure, got: ${JSON.stringify(failures[0])}`)
  }

  const orderID = Number(successes[0].orderId)
  if (!Number.isFinite(orderID)) {
    throw new Error(`Missing orderId in successful checkout response: ${JSON.stringify(successes[0])}`)
  }

  const productAfter = await payload.findByID({
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

  const stockAfter = asNumber(productAfter.stock)
  const allocatedAfter = asNumber(productAfter.allocatedStock)
  if (stockAfter !== 0 || allocatedAfter !== 0) {
    throw new Error(
      `Expected stock/allocated to be 0/0 after one successful checkout. got ${stockAfter}/${allocatedAfter}`,
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

  console.log('OK: Concurrent checkout protection validated (1 success, 1 stock failure).')
  console.log({
    productID,
    orderID,
    successStatus: successes[0].status,
    failureStatus: failures[0].status,
    failureMessage,
    stockBefore,
    allocatedBefore,
    stockAfter,
    allocatedAfter,
  })
}

await main()
