import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { releaseOrderAllocation } from '@/lib/server/shop/orderInventory'
import { isLocale } from '@/lib/i18n/core'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function GET(request: Request) {
  const cronHeader = asString(request.headers.get('x-vercel-cron'))
  const expectedSecret =
    asString(process.env.SHOP_RELEASE_ALLOCATIONS_SECRET) || asString(process.env.CRON_SECRET)
  const providedSecret = asString(new URL(request.url).searchParams.get('secret'))
  const authHeader = asString(request.headers.get('authorization'))
  const bearerSecret =
    authHeader.toLowerCase().startsWith('bearer ') && authHeader.length > 7
      ? authHeader.slice(7).trim()
      : ''

  const authorizedByCron = cronHeader === '1'
  const authorizedBySecret =
    expectedSecret.length > 0 &&
    (providedSecret === expectedSecret || bearerSecret === expectedSecret)
  if (!authorizedByCron && !authorizedBySecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayloadClient()
    const pendingHoursInput = Number(process.env.CLEANUP_PENDING_HOURS || '1')
    const pendingHours = Number.isFinite(pendingHoursInput) && pendingHoursInput > 0 ? pendingHoursInput : 1
    const cutoffISO = new Date(Date.now() - pendingHours * 60 * 60 * 1000).toISOString()
    const localeCandidate = asString(process.env.CLEANUP_LOCALE)
    const locale = isLocale(localeCandidate) ? localeCandidate : 'it'

    const staleOrders = await payload.find({
      collection: 'orders',
      overrideAccess: true,
      depth: 0,
      limit: 500,
      where: {
        and: [
          { paymentProvider: { equals: 'stripe' } },
          { status: { equals: 'pending' } },
          { paymentStatus: { equals: 'pending' } },
          { inventoryCommitted: { equals: false } },
          { allocationReleased: { equals: false } },
          { createdAt: { less_than: cutoffISO } },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
      },
    })

    let released = 0
    let failed = 0

    for (const order of staleOrders.docs) {
      try {
        await releaseOrderAllocation({
          payload,
          orderID: order.id,
          locale,
        })
        await payload.update({
          collection: 'orders',
          id: order.id,
          overrideAccess: true,
          locale,
          data: {
            status: 'cancelled',
            paymentStatus: 'failed',
          },
        })
        released += 1
      } catch (error) {
        failed += 1
        payload.logger.error({
          err: error,
          msg: `Failed to release stale allocation for order ${String(order.id)}.`,
        })
      }
    }

    return NextResponse.json({
      ok: true,
      scanned: staleOrders.totalDocs,
      released,
      failed,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to release stale allocations.' },
      { status: 500 },
    )
  }
}
