import type { PayloadRequest } from 'payload'

import { sendProductWaitlistAvailableNotification } from '@/lib/server/email/businessNotifications'

const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const getAvailableProductUnits = (value: {
  stock?: unknown
  allocatedStock?: unknown
}) => Math.max(0, asNumber(value.stock) - asNumber(value.allocatedStock))

export const notifyProductWaitlistsOnAvailability = async ({
  req,
  doc,
  previousDoc,
}: {
  req: PayloadRequest
  doc: Record<string, unknown>
  previousDoc?: Record<string, unknown> | null
}) => {
  const previousAvailable = getAvailableProductUnits({
    stock: previousDoc?.stock,
    allocatedStock: previousDoc?.allocatedStock,
  })
  const nextAvailable = getAvailableProductUnits({
    stock: doc.stock,
    allocatedStock: doc.allocatedStock,
  })

  if (previousAvailable > 0 || nextAvailable <= 0) return

  const productID = typeof doc.id === 'number' || typeof doc.id === 'string' ? doc.id : null
  if (!productID) return

  const waitlists = await req.payload.find({
    collection: 'product-waitlists',
    overrideAccess: true,
    req,
    depth: 0,
    limit: 500,
    where: {
      and: [
        { product: { equals: productID } },
        { status: { equals: 'active' } },
      ],
    },
  })

  if (waitlists.totalDocs === 0) return

  const now = new Date().toISOString()
  const productTitle = asString(doc.title) || asString(doc.slug) || `Prodotto ${String(productID)}`
  const productSlug = asString(doc.slug)

  for (const entry of waitlists.docs) {
    try {
      await sendProductWaitlistAvailableNotification({
        payload: req.payload,
        req,
        customerEmail: asString(entry.customerEmail),
        customerFirstName: asString(entry.customerFirstName),
        customerLastName: asString(entry.customerLastName),
        productTitle: asString(entry.productTitle) || productTitle,
        productSlug: asString(entry.productSlug) || productSlug,
        productBrand: asString(entry.productBrand),
        locale: asString(entry.locale) || 'it',
      })

      await req.payload.update({
        collection: 'product-waitlists',
        id: entry.id,
        overrideAccess: true,
        req,
        data: {
          status: 'notified',
          notifiedAt: now,
          lastAvailabilityAt: now,
          notificationError: '',
        },
      })
    } catch (error) {
      await req.payload.update({
        collection: 'product-waitlists',
        id: entry.id,
        overrideAccess: true,
        req,
        data: {
          notificationError: error instanceof Error ? error.message : 'Unknown waitlist notification error',
        },
      })
    }
  }
}
