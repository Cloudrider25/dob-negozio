import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'
import { sendSMTPEmail } from '@/lib/email/sendSMTPEmail'
import { commitOrderInventory, releaseOrderAllocation } from '@/lib/shop/orderInventory'
import { getShopIntegrationsConfig } from '@/lib/shop/shopIntegrationsConfig'
import { createSendcloudParcel } from '@/lib/sendcloud/createParcel'

type WebhookPayload = {
  eventID?: string
  type?: string
  provider?: string
  locale?: string
  data?: {
    orderID?: string | number
    paymentReference?: string
  }
}

const computeSignature = (secret: string, body: string) =>
  crypto.createHmac('sha256', secret).update(body).digest('hex')

const safeEqual = (a: string, b: string) => {
  const first = Buffer.from(a)
  const second = Buffer.from(b)
  if (first.length !== second.length) return false
  return crypto.timingSafeEqual(first, second)
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const toInvoiceAttachment = async ({
  stripe,
  orderNumber,
  checkoutSessionID,
}: {
  stripe: Stripe
  orderNumber: string
  checkoutSessionID: string
}) => {
  const readInvoicePDF = async () => {
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionID, {
      expand: ['invoice'],
    })
    const invoice = session.invoice
    if (!invoice) return ''
    if (typeof invoice === 'string') {
      const fullInvoice = await stripe.invoices.retrieve(invoice)
      return asString(fullInvoice.invoice_pdf)
    }
    return asString(invoice.invoice_pdf)
  }

  let invoicePDFUrl = ''
  for (let attempt = 0; attempt < 5; attempt += 1) {
    invoicePDFUrl = await readInvoicePDF()
    if (invoicePDFUrl) break
    await sleep(700)
  }
  if (!invoicePDFUrl) return null

  const invoicePDFResponse = await fetch(invoicePDFUrl, {
    cache: 'no-store',
  })
  if (!invoicePDFResponse.ok) {
    throw new Error(`Unable to fetch Stripe invoice PDF (${invoicePDFResponse.status}).`)
  }
  const invoiceBuffer = Buffer.from(await invoicePDFResponse.arrayBuffer())

  return {
    filename: `invoice-${orderNumber}.pdf`,
    content: invoiceBuffer,
    contentType: 'application/pdf',
  }
}

export async function POST(request: Request) {
  const payload = await getPayloadClient()
  const integrations = await getShopIntegrationsConfig(payload)
  const rawBody = await request.text()

  let eventID = ''
  let type = ''
  let provider = 'custom'
  let providerEventType = ''
  let orderID = NaN
  let locale: Locale = 'it'
  let payloadBody: WebhookPayload | Record<string, unknown> = {}
  let stripeClient: Stripe | null = null
  let stripeCheckoutSessionID = ''

  const stripeSignature = request.headers.get('stripe-signature')?.trim()
  const stripeWebhookSecret = integrations.stripe.webhookSecret
  const stripeSecretKey = integrations.stripe.secretKey

  if (stripeSignature && stripeWebhookSecret && stripeSecretKey) {
    try {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2026-01-28.clover',
      })
      stripeClient = stripe
      const event = stripe.webhooks.constructEvent(rawBody, stripeSignature, stripeWebhookSecret)
      provider = 'stripe'
      providerEventType = event.type
      eventID = event.id
      payloadBody = event as unknown as Record<string, unknown>

      const readOrderID = async () => {
        const object = event.data.object as unknown as Record<string, unknown>
        const metadata =
          object && typeof object.metadata === 'object' && object.metadata !== null
            ? (object.metadata as Record<string, unknown>)
            : {}
        const fromMetadata = asString(metadata.orderID)
        if (fromMetadata) return Number(fromMetadata)

        const fromClientReference = asString(object.client_reference_id)
        if (fromClientReference) return Number(fromClientReference)

        if (event.type.startsWith('payment_intent.')) {
          const paymentIntentID = asString(object.id)
          if (paymentIntentID) {
            const sessions = await stripe.checkout.sessions.list({
              payment_intent: paymentIntentID,
              limit: 1,
            })
            const session = sessions.data[0]
            if (session) {
              const sessionMetadata = session.metadata || {}
              const fromSessionMetadata = asString(sessionMetadata.orderID)
              if (fromSessionMetadata) return Number(fromSessionMetadata)
              if (session.client_reference_id) return Number(session.client_reference_id)
            }
          }
        }

        return NaN
      }

      switch (event.type) {
        case 'checkout.session.completed':
        case 'payment_intent.succeeded':
          type = 'payment.paid'
          break
        case 'payment_intent.payment_failed':
          type = 'payment.failed'
          break
        case 'checkout.session.expired':
          type = 'payment.cancelled'
          break
        case 'charge.refunded':
          type = 'payment.refunded'
          break
        default:
          type = event.type
          break
      }

      const object = event.data.object as unknown as Record<string, unknown>
      const metadata =
        object && typeof object.metadata === 'object' && object.metadata !== null
          ? (object.metadata as Record<string, unknown>)
          : {}
      const localeInput = asString(metadata.locale)
      locale = isLocale(localeInput) ? localeInput : 'it'
      if (event.type === 'checkout.session.completed') {
        stripeCheckoutSessionID = asString(object.id)
      }
      orderID = await readOrderID()
    } catch {
      return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 401 })
    }
  } else {
    const secret = process.env.SHOP_WEBHOOK_SECRET?.trim()
    if (!secret) {
      return NextResponse.json({ error: 'Webhook unavailable.' }, { status: 503 })
    }

    const signature = request.headers.get('x-shop-signature')?.trim() || ''
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature.' }, { status: 401 })
    }

    const expected = computeSignature(secret, rawBody)
    if (!safeEqual(signature, expected)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })
    }

    try {
      const parsed = JSON.parse(rawBody) as WebhookPayload
      payloadBody = parsed
      eventID = asString(parsed.eventID)
      type = asString(parsed.type)
      provider = asString(parsed.provider) || 'custom'
      const rawOrderID = parsed.data?.orderID
      orderID =
        typeof rawOrderID === 'number'
          ? rawOrderID
          : typeof rawOrderID === 'string' && rawOrderID.trim() !== ''
            ? Number(rawOrderID)
            : NaN
      const localeInput = asString(parsed.locale)
      locale = isLocale(localeInput) ? localeInput : 'it'
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
    }
  }

  if (!eventID || !type || !Number.isFinite(orderID)) {
    return NextResponse.json(
      { error: 'Missing required fields: eventID, type, data.orderID.' },
      { status: 400 },
    )
  }

  const existing = await payload.find({
    collection: 'shop-webhook-events',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      eventID: { equals: eventID },
    },
  })

  if (existing.totalDocs > 0) {
    return NextResponse.json({ ok: true, idempotent: true }, { status: 200 })
  }

  const event = await payload.create({
    collection: 'shop-webhook-events',
    overrideAccess: true,
    draft: false,
    locale,
    data: {
      eventID,
      type,
      provider,
      order: orderID,
      payload: payloadBody,
      processed: false,
    },
  })

  try {
    switch (type) {
      case 'payment.paid':
        {
          const orderBefore = await payload.findByID({
            collection: 'orders',
            id: orderID,
            overrideAccess: true,
            depth: 0,
            locale,
          })
          const wasAlreadyPaid =
            orderBefore.paymentStatus === 'paid' || orderBefore.status === 'paid'

        await commitOrderInventory({
          payload,
          orderID,
          locale,
        })

          const order = await payload.findByID({
            collection: 'orders',
            id: orderID,
            overrideAccess: true,
            depth: 0,
            locale,
          })

          if (!wasAlreadyPaid) {
            try {
              let attachments: Array<{ filename?: string; content: Buffer; contentType?: string }> = []
              if (provider === 'stripe' && stripeClient && stripeCheckoutSessionID) {
                try {
                  const invoiceAttachment = await toInvoiceAttachment({
                    stripe: stripeClient,
                    orderNumber: order.orderNumber,
                    checkoutSessionID: stripeCheckoutSessionID,
                  })
                  if (invoiceAttachment) {
                    attachments = [invoiceAttachment]
                  }
                } catch (invoiceError) {
                  payload.logger.warn({
                    err: invoiceError,
                    msg: `Invoice attachment unavailable for order ${order.orderNumber}, sending email without attachment.`,
                  })
                }
              }

              await sendSMTPEmail({
                payload,
                to: order.customerEmail,
                subject: `Conferma ordine ${order.orderNumber}`,
                text: [
                  `Ciao ${order.customerFirstName},`,
                  '',
                  `abbiamo ricevuto il tuo ordine ${order.orderNumber}.`,
                  `Totale: EUR ${order.total.toFixed(2)}`,
                  '',
                  'Grazie,',
                  'DOB Milano',
                ].join('\n'),
                html: `
                <p>Ciao ${order.customerFirstName},</p>
                <p>abbiamo ricevuto il tuo ordine <strong>${order.orderNumber}</strong>.</p>
                <p>Totale: <strong>EUR ${order.total.toFixed(2)}</strong></p>
                <p>Grazie,<br/>DOB Milano</p>
              `,
                attachments,
              })
            } catch (emailError) {
              payload.logger.error({
                err: emailError,
                msg: `Order confirmation email failed for order ${order.orderNumber}`,
              })
            }
          }

          if (
            provider === 'stripe' &&
            (providerEventType === 'checkout.session.completed' ||
              providerEventType === 'payment_intent.succeeded')
          ) {
            try {
              const existingParcelID =
                order.sendcloud && typeof order.sendcloud === 'object' && order.sendcloud !== null
                  ? order.sendcloud.parcelId
                  : null

              if (typeof existingParcelID !== 'number') {
                const sendcloud = await createSendcloudParcel({
                  payload,
                  order,
                })

                if (sendcloud) {
                  await payload.update({
                    collection: 'orders',
                    id: orderID,
                    overrideAccess: true,
                    locale,
                    data: {
                      sendcloud: {
                        parcelId: sendcloud.parcelId,
                        carrierCode: sendcloud.carrierCode || undefined,
                        trackingNumber: sendcloud.trackingNumber || undefined,
                        trackingUrl: sendcloud.trackingUrl || undefined,
                        labelUrl: sendcloud.labelUrl || undefined,
                        statusMessage: sendcloud.statusMessage || 'Parcel creato su Sendcloud',
                        lastSyncAt: new Date().toISOString(),
                        error: '',
                      },
                    },
                  })
                }
              }
            } catch (shippingError) {
              payload.logger.error({
                err: shippingError,
                msg: `Sendcloud sync failed for order ${orderID}`,
              })
              await payload.update({
                collection: 'orders',
                id: orderID,
                overrideAccess: true,
                locale,
                data: {
                  sendcloud: {
                    error:
                      shippingError instanceof Error
                        ? shippingError.message
                        : 'Unknown Sendcloud sync error',
                    lastSyncAt: new Date().toISOString(),
                  },
                },
              })
            }
          }
        }
        break
      case 'payment.failed':
      case 'payment.cancelled':
        await releaseOrderAllocation({
          payload,
          orderID,
          locale,
        })
        break
      case 'payment.refunded':
        await payload.update({
          collection: 'orders',
          id: orderID,
          overrideAccess: true,
          locale,
          data: {
            status: 'refunded',
            paymentStatus: 'refunded',
          },
        })
        break
      default:
        break
    }

    await payload.update({
      collection: 'shop-webhook-events',
      id: event.id,
      overrideAccess: true,
      locale,
      data: {
        processed: true,
        processedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: 'Webhook processing failed.',
    })
    await payload.update({
      collection: 'shop-webhook-events',
      id: event.id,
      overrideAccess: true,
      locale,
      data: {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown webhook error',
      },
    })
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
