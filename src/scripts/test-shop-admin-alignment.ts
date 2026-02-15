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

  process.env.SHOP_AUTO_CAPTURE = 'false'

  const product = await findProductForTest(payload)
  if (!product) throw new Error('No active product available for admin alignment test.')

  const productID = Number(product.id)
  const allocatedBefore = asNumber(product.allocatedStock)
  const deliveriesBefore = Array.isArray(product.deliveries) ? product.deliveries : []

  if (!Number.isFinite(productID)) {
    throw new Error('Product ID must be numeric for admin alignment test.')
  }

  await payload.update({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale: 'it',
    data: {
      deliveries: [
        ...deliveriesBefore,
        {
          lot: `qa-admin-align-${Date.now()}`,
          quantity: 1,
          costPerUnit: 1,
          deliveryDate: new Date().toISOString(),
        },
      ],
      allocatedStock: allocatedBefore,
    },
  })

  let orderID: string | number | undefined

  try {
    const email = `qa+admin-alignment-${Date.now()}@example.com`
    const checkoutRes = await checkoutPOST(
      new Request('http://localhost/api/shop/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale: 'it',
          customer: {
            email,
            firstName: 'QA',
            lastName: 'Admin',
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
      orderNumber?: string
      total?: number
      currency?: string
      status?: string
      error?: string
    }

    if (!checkoutRes.ok || !checkoutJson.ok || !checkoutJson.orderId || !checkoutJson.orderNumber) {
      throw new Error(`Checkout failed in admin alignment test: ${JSON.stringify(checkoutJson)}`)
    }

    orderID = checkoutJson.orderId

    const order = await payload.findByID({
      collection: 'orders',
      id: orderID,
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        subtotal: true,
        shippingAmount: true,
        discountAmount: true,
        currency: true,
        customerEmail: true,
        inventoryCommitted: true,
        allocationReleased: true,
      },
    })

    if (order.orderNumber !== checkoutJson.orderNumber) {
      throw new Error(
        `Order number mismatch between API and admin record: ${checkoutJson.orderNumber} vs ${order.orderNumber}`,
      )
    }
    if (order.status !== 'pending' || order.paymentStatus !== 'pending') {
      throw new Error(
        `Expected pending/pending order after checkout with auto-capture disabled, got ${order.status}/${order.paymentStatus}`,
      )
    }
    if (order.customerEmail !== email) {
      throw new Error(`Customer email mismatch in admin order record: ${order.customerEmail} vs ${email}`)
    }
    if (order.currency !== 'EUR') {
      throw new Error(`Expected EUR currency in admin order, got ${order.currency}`)
    }
    if (order.inventoryCommitted || order.allocationReleased) {
      throw new Error('Unexpected inventory flags for pending order.')
    }

    const orderItems = await payload.find({
      collection: 'order-items',
      overrideAccess: true,
      locale: 'it',
      depth: 0,
      where: {
        order: { equals: orderID },
      },
      limit: 200,
      select: {
        lineTotal: true,
        quantity: true,
        unitPrice: true,
      },
    })

    if (orderItems.totalDocs <= 0) {
      throw new Error('No order-items found in admin for created checkout order.')
    }

    const linesTotal = orderItems.docs.reduce((sum, item) => sum + asNumber(item.lineTotal), 0)
    const expectedTotal =
      asNumber(order.subtotal) + asNumber(order.shippingAmount) - asNumber(order.discountAmount)

    if (Math.abs(linesTotal - asNumber(order.subtotal)) > 0.0001) {
      throw new Error(`Order items subtotal mismatch. lines=${linesTotal} subtotal=${order.subtotal}`)
    }
    if (Math.abs(asNumber(order.total) - expectedTotal) > 0.0001) {
      throw new Error(`Order total mismatch. total=${order.total} expected=${expectedTotal}`)
    }

    console.log('OK: Checkout confirmation data aligned with admin order and order-items records.')
    console.log({
      orderID,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      linesTotal,
      orderItems: orderItems.totalDocs,
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
