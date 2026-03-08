import { getPayload } from 'payload'
import config from '../src/payload/config'

const orderNumber = process.argv[2]

if (!orderNumber) {
  console.error('Usage: pnpm payload run scripts/inspect-order-promo.ts <ORDER_NUMBER>')
  process.exit(1)
}

const payload = await getPayload({ config })

const result = await payload.find({
  collection: 'orders',
  overrideAccess: true,
  depth: 1,
  limit: 1,
  where: {
    orderNumber: {
      equals: orderNumber,
    },
  },
})

if (!result.docs.length) {
  console.error(`Order not found: ${orderNumber}`)
  process.exit(2)
}

const order = result.docs[0] as unknown as Record<string, unknown>

console.log(
  JSON.stringify(
    {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentProvider: order.paymentProvider,
      paymentReference: order.paymentReference,
      subtotal: order.subtotal,
      shippingAmount: order.shippingAmount,
      discountAmount: order.discountAmount,
      commissionAmount: order.commissionAmount,
      total: order.total,
      promoCodeValue: order.promoCodeValue,
      promoCode: order.promoCode,
      partner: order.partner,
      commissionStatus: order.commissionStatus,
      promoCodeSnapshot: order.promoCodeSnapshot,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
    null,
    2,
  ),
)
