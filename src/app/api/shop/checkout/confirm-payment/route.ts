import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { sendOrderPaidNotifications } from '@/lib/server/email/businessNotifications'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n/core'
import { createOrderFromCheckoutAttempt } from '@/lib/server/shop/checkoutAttempts'
import { getShopIntegrationsConfig } from '@/lib/server/shop/shopIntegrationsConfig'

type ConfirmPayload = {
  orderId?: string | number
  attemptId?: string | number
  paymentIntentId?: string
  locale?: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmPayload
    const attemptIdRaw = body.attemptId
    const attemptId =
      typeof attemptIdRaw === 'number'
        ? attemptIdRaw
        : typeof attemptIdRaw === 'string' && attemptIdRaw.trim()
          ? Number(attemptIdRaw)
          : NaN
    const legacyOrderIdRaw = body.orderId
    const legacyOrderId =
      typeof legacyOrderIdRaw === 'number'
        ? legacyOrderIdRaw
        : typeof legacyOrderIdRaw === 'string' && legacyOrderIdRaw.trim()
          ? Number(legacyOrderIdRaw)
          : NaN

    const localeInput = asString(body.locale)
    const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
    const paymentIntentId = asString(body.paymentIntentId)

    if (!paymentIntentId || (!Number.isFinite(attemptId) && !Number.isFinite(legacyOrderId))) {
      return NextResponse.json({ error: 'Missing attemptId/orderId or paymentIntentId' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const integrations = await getShopIntegrationsConfig(payload)
    if (!integrations.stripe.secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const stripe = new Stripe(integrations.stripe.secretKey, {
      apiVersion: '2026-01-28.clover',
    })

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { ok: false, status: paymentIntent.status, error: 'Payment not finalized' },
        { status: 409 },
      )
    }

    if (Number.isFinite(attemptId)) {
      const attempt = await payload.findByID({
        collection: 'checkout-attempts',
        id: attemptId,
        overrideAccess: true,
        locale,
        depth: 0,
      })

      const paymentReference = asString(attempt.paymentReference)
      if (paymentReference && paymentReference !== paymentIntent.id) {
        return NextResponse.json({ error: 'Payment reference mismatch' }, { status: 409 })
      }

      const { order, created } = await createOrderFromCheckoutAttempt({
        payload,
        locale,
        attempt,
      })

      if (created) {
        await sendOrderPaidNotifications({
          payload,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerFirstName: order.customerFirstName,
          customerLastName: order.customerLastName,
          total: order.total,
          cartMode: order.cartMode,
          productFulfillmentMode: order.productFulfillmentMode,
          appointmentMode: order.appointmentMode,
          appointmentRequestedDate: order.appointmentRequestedDate,
          appointmentRequestedTime: order.appointmentRequestedTime,
        })
      }

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
      })
    }

    const order = await payload.findByID({
      collection: 'orders',
      id: legacyOrderId,
      overrideAccess: true,
      locale,
      depth: 0,
    })

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('Checkout confirm-payment fallback error', error)
    return NextResponse.json({ error: 'Unable to confirm payment.' }, { status: 500 })
  }
}
