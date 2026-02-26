import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import type { Locale } from '../lib/i18n'
import { releaseOrderAllocation } from '../lib/shop/orderInventory'

const asHours = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const formatDate = (value: string | undefined | null) => {
  if (!value) return 'n/a'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toISOString()
}

const main = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const locale = (((process.env.CLEANUP_LOCALE || 'it').trim() || 'it') as Locale)
  const olderThanHours = asHours(process.env.CLEANUP_PENDING_HOURS, 2)
  const dryRun = process.env.CLEANUP_DRY_RUN === 'true'
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)

  const result = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    locale,
    depth: 0,
    limit: 500,
    sort: 'createdAt',
    where: {
      and: [
        { paymentProvider: { equals: 'stripe' } },
        { status: { equals: 'pending' } },
        { paymentStatus: { equals: 'pending' } },
        { createdAt: { less_than: cutoff.toISOString() } },
      ],
    },
  })

  if (result.docs.length === 0) {
    console.log(`No abandoned Stripe checkouts older than ${olderThanHours}h.`)
    return
  }

  console.log(
    `${dryRun ? '[DRY RUN] ' : ''}Found ${result.docs.length} abandoned Stripe checkouts older than ${olderThanHours}h (cutoff ${cutoff.toISOString()}).`,
  )

  let processed = 0
  let failed = 0

  for (const order of result.docs) {
    const orderId = String(order.id)
    const orderNumber = typeof order.orderNumber === 'string' ? order.orderNumber : orderId

    try {
      console.log(
        `${dryRun ? '[DRY] ' : ''}${orderNumber} | createdAt=${formatDate(order.createdAt)} | total=${typeof order.total === 'number' ? order.total.toFixed(2) : 'n/a'}`,
      )

      if (dryRun) {
        processed += 1
        continue
      }

      await releaseOrderAllocation({
        payload: payload as Payload,
        orderID: orderId,
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

      processed += 1
    } catch (error) {
      failed += 1
      payload.logger.error({
        err: error,
        msg: `cleanup-abandoned-checkouts failed for order ${orderNumber}`,
      })
    }
  }

  console.log(
    `${dryRun ? '[DRY RUN] ' : ''}Done. processed=${processed} failed=${failed} total=${result.docs.length}`,
  )
}

void main()
