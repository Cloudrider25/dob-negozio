import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'
import { commitOrderInventory } from '@/lib/shop/orderInventory'
import { getShopIntegrationsConfig } from '@/lib/shop/shopIntegrationsConfig'

type ConfirmPayload = {
  orderId?: string | number
  paymentIntentId?: string
  locale?: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmPayload
    const orderIdRaw = body.orderId
    const orderId =
      typeof orderIdRaw === 'number'
        ? orderIdRaw
        : typeof orderIdRaw === 'string' && orderIdRaw.trim()
          ? Number(orderIdRaw)
          : NaN

    const localeInput = asString(body.locale)
    const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
    const paymentIntentId = asString(body.paymentIntentId)

    if (!Number.isFinite(orderId) || !paymentIntentId) {
      return NextResponse.json({ error: 'Missing orderId or paymentIntentId' }, { status: 400 })
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
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
      return NextResponse.json(
        { ok: false, status: paymentIntent.status, error: 'Payment not finalized' },
        { status: 409 },
      )
    }

    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      overrideAccess: true,
      locale,
      depth: 0,
    })

    const paymentReference = asString(order.paymentReference)
    if (paymentReference && paymentReference !== paymentIntent.id) {
      return NextResponse.json({ error: 'Payment reference mismatch' }, { status: 409 })
    }

    if (order.paymentStatus !== 'paid' && order.status !== 'paid') {
      await commitOrderInventory({
        payload,
        orderID: orderId,
        locale,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Checkout confirm-payment fallback error', error)
    return NextResponse.json({ error: 'Unable to confirm payment.' }, { status: 500 })
  }
}

