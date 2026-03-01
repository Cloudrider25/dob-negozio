import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import type { OrderServiceSession } from '@/payload-types'

export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const authResult = await payload.auth({ headers: request.headers })
  const user = authResult?.user && typeof authResult.user === 'object' ? authResult.user : null

  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const ordersResult = await payload.find({
    collection: 'orders',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 100,
    sort: '-createdAt',
    where: {
      customer: { equals: user.id },
    },
  })

  const orders = ordersResult.docs.filter((order) => {
    const isStripePendingAbandoned =
      order.paymentProvider === 'stripe' &&
      order.paymentStatus === 'pending' &&
      order.status === 'pending'

    return !isStripePendingAbandoned
  })

  const orderIds = orders.map((order) => order.id)
  if (orderIds.length === 0) {
    return NextResponse.json({ docs: [] })
  }

  // Intentional admin Local API read, constrained to already-authorized user's orders.
  const serviceSessionsResult = await payload.find({
    collection: 'order-service-sessions',
    depth: 1,
    limit: 500,
    sort: '-createdAt',
    where: {
      order: { in: orderIds },
    },
  })

  const docs = (serviceSessionsResult.docs as OrderServiceSession[])
    .map((session) => {
      const orderRelation = typeof session.order === 'object' && session.order ? session.order : null
      if (!orderRelation) return null

      return {
        id: String(session.id),
        orderServiceItemId:
          typeof session.orderServiceItem === 'number'
            ? String(session.orderServiceItem)
            : session.orderServiceItem &&
                typeof session.orderServiceItem === 'object' &&
                'id' in session.orderServiceItem
              ? String((session.orderServiceItem as { id?: number | string }).id ?? '')
              : '',
        sessionIndex: typeof session.sessionIndex === 'number' ? session.sessionIndex : 1,
        orderId: orderRelation.id,
        orderNumber: orderRelation.orderNumber,
        orderCreatedAt: orderRelation.createdAt,
        orderStatus: orderRelation.status,
        paymentStatus: orderRelation.paymentStatus,
        itemKind: session.itemKind,
        serviceTitle: session.serviceTitle,
        variantLabel:
          session.variantLabel?.trim() || (session.itemKind === 'package' ? 'Pacchetto' : 'Default'),
        sessionLabel:
          session.sessionLabel?.trim() ||
          (session.itemKind === 'package' ? `Seduta ${session.sessionIndex ?? 1}` : 'Seduta unica'),
        sessionsTotal: Math.max(1, session.sessionsTotal ?? 1),
        durationMinutes: session.durationMinutes ?? null,
        rowPrice: session.sessionPrice,
        currency: session.currency,
        appointmentMode: session.appointmentMode ?? 'none',
        appointmentStatus: session.appointmentStatus ?? 'none',
        requestedDate: session.appointmentRequestedDate ?? null,
        requestedTime: session.appointmentRequestedTime ?? null,
        proposedDate: session.appointmentProposedDate ?? null,
        proposedTime: session.appointmentProposedTime ?? null,
        confirmedAt: session.appointmentConfirmedAt ?? null,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  return NextResponse.json({ docs })
}
