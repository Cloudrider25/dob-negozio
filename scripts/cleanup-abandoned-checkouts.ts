import { getPayload, type Payload } from 'payload'

import config from '../src/payload/config'
import type { Locale } from '../src/lib/i18n/core'
import { releaseCheckoutAttemptInventory, type CheckoutAttemptProductItem } from '../src/lib/server/shop/checkoutAttempts'
import { releaseOrderAllocation } from '../src/lib/server/shop/orderInventory'

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
  const nowIso = new Date().toISOString()

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

  const attemptsResult = await payload.find({
    collection: 'checkout-attempts',
    overrideAccess: true,
    locale,
    depth: 0,
    limit: 500,
    sort: 'createdAt',
    where: {
      and: [
        { paymentProvider: { equals: 'stripe' } },
        { status: { equals: 'pending' } },
        {
          or: [
            { expiresAt: { less_than: nowIso } },
            {
              and: [
                { expiresAt: { exists: false } },
                { createdAt: { less_than: cutoff.toISOString() } },
              ],
            },
          ],
        },
      ],
    },
  })

  if (result.docs.length === 0 && attemptsResult.docs.length === 0) {
    console.log(`No abandoned Stripe checkouts older than ${olderThanHours}h.`)
    return
  }

  console.log(
    `${dryRun ? '[DRY RUN] ' : ''}Found ${result.docs.length} abandoned Stripe orders and ${attemptsResult.docs.length} checkout attempts older than ${olderThanHours}h (cutoff ${cutoff.toISOString()}).`,
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

  for (const attempt of attemptsResult.docs) {
    const attemptId = String(attempt.id)

    try {
      console.log(
        `${dryRun ? '[DRY] ' : ''}attempt:${attemptId} | createdAt=${formatDate(attempt.createdAt)} | total=${typeof attempt.total === 'number' ? attempt.total.toFixed(2) : 'n/a'}`,
      )

      if (dryRun) {
        processed += 1
        continue
      }

      if (attempt.inventoryReserved && !attempt.inventoryReleased) {
        await releaseCheckoutAttemptInventory({
          payload: payload as Payload,
          locale,
          productItems: Array.isArray(attempt.productItems)
            ? (attempt.productItems as CheckoutAttemptProductItem[])
            : [],
        })
      }

      await payload.update({
        collection: 'checkout-attempts',
        id: attempt.id,
        overrideAccess: true,
        locale,
        data: {
          status: 'expired',
          inventoryReserved: false,
          inventoryReleased: Boolean(attempt.inventoryReserved),
        },
      })

      processed += 1
    } catch (error) {
      failed += 1
      payload.logger.error({
        err: error,
        msg: `cleanup-abandoned-checkouts failed for checkout attempt ${attemptId}`,
      })
    }
  }

  console.log(
    `${dryRun ? '[DRY RUN] ' : ''}Done. processed=${processed} failed=${failed} total=${result.docs.length + attemptsResult.docs.length}`,
  )
}

void main()
