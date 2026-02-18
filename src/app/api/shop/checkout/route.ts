import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'
import { sendSMTPEmail } from '@/lib/email/sendSMTPEmail'
import { allocateOrderInventory, commitOrderInventory } from '@/lib/shop/orderInventory'
import { acquireInventoryLocks, releaseInventoryLocks } from '@/lib/shop/inventoryLocks'
import { getShopIntegrationsConfig } from '@/lib/shop/shopIntegrationsConfig'
import { getSendcloudShippingOptions } from '@/lib/sendcloud/getShippingQuote'
import { isFreeShippingUnlocked } from '@/lib/shop/shipping'
import type { Product } from '@/payload-types'
import Stripe from 'stripe'

const GENERIC_CHECKOUT_ERROR = 'Si è verificato un errore durante il checkout. Riprova.'

type CheckoutItemInput = {
  id: string
  quantity: number
}

type CheckoutPayload = {
  locale?: string
  checkoutMode?: 'redirect' | 'embedded' | 'payment_element'
  customer?: {
    email?: string
    firstName?: string
    lastName?: string
    address?: string
    postalCode?: string
    city?: string
    province?: string
    phone?: string
  }
  items?: CheckoutItemInput[]
  shippingOptionID?: string
}

const toString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const createOrderNumber = () => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `DOB-${y}${m}${d}-${random}`
}

const resolveBrandLabel = (product: Product, locale: string) => {
  const brand = product.brand
  if (!brand || typeof brand === 'number') return ''
  if (typeof brand.name === 'string') return brand.name
  if (brand.name && typeof brand.name === 'object') {
    const localized = brand.name as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((value) => typeof value === 'string')
    if (typeof first === 'string') return first
  }
  return ''
}

const resolveCoverImage = (product: Product) => {
  if (!product.coverImage || typeof product.coverImage === 'number') return ''
  return typeof product.coverImage.url === 'string' ? product.coverImage.url : ''
}

const toStripeAmount = (value: number) => Math.round(value * 100)

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload
    const localeInput = toString(body.locale)
    const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
    const checkoutMode =
      body.checkoutMode === 'payment_element'
        ? 'payment_element'
        : body.checkoutMode === 'embedded'
          ? 'embedded'
          : 'redirect'
    const customer = body.customer ?? {}
    const payload = await getPayloadClient()
    const authResult = await payload.auth({ headers: request.headers })
    const authenticatedUser =
      authResult && authResult.user && typeof authResult.user === 'object' ? authResult.user : null

    const isPaymentElementMode = checkoutMode === 'payment_element'
    const authenticatedEmail = toString(authenticatedUser?.email)
    const fallbackGuestEmail = `guest-${Date.now()}@dob.local`
    const email = authenticatedEmail || toString(customer.email) || (isPaymentElementMode ? fallbackGuestEmail : '')
    const firstName =
      toString(customer.firstName) ||
      toString(authenticatedUser?.firstName) ||
      (isPaymentElementMode ? 'Cliente' : '')
    const lastName =
      toString(customer.lastName) ||
      toString(authenticatedUser?.lastName) ||
      (isPaymentElementMode ? 'Express' : '')
    const address = toString(customer.address) || (isPaymentElementMode ? 'Da confermare via wallet' : '')
    const postalCode = toString(customer.postalCode) || (isPaymentElementMode ? '00000' : '')
    const city = toString(customer.city) || (isPaymentElementMode ? 'Da confermare' : '')
    const province = toString(customer.province) || (isPaymentElementMode ? 'EE' : '')
    const phone = toString(customer.phone)
    const hasShippingAddressInput =
      Boolean(toString(customer.address)) &&
      Boolean(toString(customer.postalCode)) &&
      Boolean(toString(customer.city)) &&
      Boolean(toString(customer.province))
    const shippingOptionID = toString(body.shippingOptionID)

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email non valida.' }, { status: 400 })
    }
    if (!isPaymentElementMode && (!firstName || !lastName || !address || !postalCode || !city || !province)) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori di spedizione.' },
        { status: 400 },
      )
    }

    const rawItems = Array.isArray(body.items) ? body.items : []
    const normalized = new Map<string, number>()
    for (const item of rawItems) {
      const id = toString(item?.id)
      const quantity = Number(item?.quantity)
      if (!id) continue
      if (!Number.isFinite(quantity) || quantity <= 0) continue
      const safeQuantity = Math.min(50, Math.floor(quantity))
      normalized.set(id, (normalized.get(id) ?? 0) + safeQuantity)
    }

    if (normalized.size === 0) {
      return NextResponse.json({ error: 'Carrello vuoto.' }, { status: 400 })
    }

    const productIds = Array.from(normalized.keys())
    let locks: Awaited<ReturnType<typeof acquireInventoryLocks>> = []
    try {
      locks = await acquireInventoryLocks({
        payload,
        productIDs: productIds,
      })
    } catch (lockError) {
      payload.logger.error({
        err: lockError,
        msg: 'Unable to acquire inventory locks for checkout.',
      })
      return NextResponse.json(
        { error: 'Checkout momentaneamente occupato. Riprova tra qualche secondo.' },
        { status: 409 },
      )
    }

    try {
      const productsResult = await payload.find({
      collection: 'products',
      limit: productIds.length,
      depth: 1,
      overrideAccess: false,
      locale,
      where: {
        and: [{ id: { in: productIds } }, { active: { equals: true } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        brand: true,
        coverImage: true,
        price: true,
        stock: true,
        allocatedStock: true,
        active: true,
      },
    })

      const productsById = new Map(productsResult.docs.map((doc) => [String(doc.id), doc]))
      const missing = productIds.filter((id) => !productsById.has(id))
      if (missing.length > 0) {
        return NextResponse.json(
          { error: 'Alcuni prodotti non sono più disponibili.', missing },
          { status: 409 },
        )
      }

      type LineItem = {
        product: Product
        quantity: number
        unitPrice: number
        lineTotal: number
        available: number
      }

      const lineItems: LineItem[] = []
      for (const [id, quantity] of normalized.entries()) {
        const product = productsById.get(id)
        if (!product) continue
        if (typeof product.price !== 'number' || product.price < 0) {
          return NextResponse.json(
            { error: `Prezzo non valido per il prodotto ${product.title || id}.` },
            { status: 409 },
          )
        }
        const stock = typeof product.stock === 'number' ? product.stock : 0
        const allocated = typeof product.allocatedStock === 'number' ? product.allocatedStock : 0
        const available = Math.max(0, stock - allocated)
        if (quantity > available) {
          return NextResponse.json(
            {
              error: `Disponibilità insufficiente per ${product.title || id}.`,
              productId: id,
              requested: quantity,
              available,
            },
            { status: 409 },
          )
        }
        lineItems.push({
          product,
          quantity,
          unitPrice: product.price,
          lineTotal: product.price * quantity,
          available,
        })
      }

      const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
      let shippingAmount = 0
      if (!isFreeShippingUnlocked(subtotal) && (!isPaymentElementMode || hasShippingAddressInput)) {
        const shippingOptions = await getSendcloudShippingOptions({
          payload,
          toCountry: 'IT',
          toPostalCode: postalCode,
        })
        if (shippingOptions.length > 0) {
          const selectedOption =
            shippingOptions.find((option) => option.id === shippingOptionID) || shippingOptions[0]
          shippingAmount = selectedOption.amount
        }
      }
      const discountAmount = 0
      const total = Math.max(0, subtotal + shippingAmount - discountAmount)

      const createdOrder = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      locale,
      draft: false,
      data: {
        orderNumber: createOrderNumber(),
        status: 'pending',
        paymentStatus: 'pending',
        paymentProvider: 'manual',
        paymentReference: '',
        inventoryCommitted: false,
        allocationReleased: false,
        currency: 'EUR',
        locale,
        subtotal,
        shippingAmount,
        discountAmount,
        total,
        customerEmail: email,
        customer: typeof authenticatedUser?.id === 'number' ? authenticatedUser.id : undefined,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone || undefined,
        shippingAddress: {
          address,
          postalCode,
          city,
          province,
          country: 'Italy',
        },
      },
    })

      const rollbackAllocated = new Map<string, number>()
      const createdItemIDs: Array<string | number> = []

      try {
        for (const item of lineItems) {
          const productId = String(item.product.id)
          const currentAllocated =
            typeof item.product.allocatedStock === 'number' ? item.product.allocatedStock : 0
          rollbackAllocated.set(productId, currentAllocated)

          const createdItem = await payload.create({
            collection: 'order-items',
            overrideAccess: true,
            locale,
            draft: false,
            data: {
              order: createdOrder.id,
              product: item.product.id,
              productTitle: item.product.title || productId,
              productSlug: item.product.slug || undefined,
              productBrand: resolveBrandLabel(item.product, locale),
              productCoverImage: resolveCoverImage(item.product) || undefined,
              currency: 'EUR',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            },
          })
          createdItemIDs.push(createdItem.id)
        }

        await allocateOrderInventory({
          payload,
          orderID: String(createdOrder.id),
          locale,
        })

        const integrations = await getShopIntegrationsConfig(payload)
        const stripeSecret = integrations.stripe.secretKey
        const stripePublishableKey = integrations.stripe.publishableKey
        const isStripeEnabled = stripeSecret.length > 0

        if (isStripeEnabled) {
          if (
            (checkoutMode === 'embedded' || checkoutMode === 'payment_element') &&
            stripePublishableKey.length === 0
          ) {
            return NextResponse.json(
              { error: 'Stripe publishable key non configurata.' },
              { status: 500 },
            )
          }

          const stripe = new Stripe(stripeSecret, {
            apiVersion: '2026-01-28.clover',
          })
          const requestUrl = new URL(request.url)
          const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
            `${requestUrl.protocol}//${requestUrl.host}`

          const sessionPayloadBase = {
            mode: 'payment' as const,
            customer_email: email,
            client_reference_id: String(createdOrder.id),
            metadata: {
              orderID: String(createdOrder.id),
              customerID:
                typeof authenticatedUser?.id === 'number' ? String(authenticatedUser.id) : '',
              locale,
            },
            invoice_creation: {
              enabled: true,
            },
            payment_intent_data: {
              metadata: {
                orderID: String(createdOrder.id),
                customerID:
                  typeof authenticatedUser?.id === 'number' ? String(authenticatedUser.id) : '',
                locale,
              },
            },
            line_items: lineItems.map((item) => ({
              quantity: item.quantity,
              price_data: {
                currency: 'eur',
                unit_amount: toStripeAmount(item.unitPrice),
                product_data: {
                  name: item.product.title || String(item.product.id),
                },
              },
            })),
          }
          const stripeLineItems = [...sessionPayloadBase.line_items]
          if (shippingAmount > 0) {
            stripeLineItems.push({
              quantity: 1,
              price_data: {
                currency: 'eur',
                unit_amount: toStripeAmount(shippingAmount),
                product_data: {
                  name: 'Shipping',
                },
              },
            })
          }

          if (checkoutMode === 'payment_element') {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: toStripeAmount(total),
              currency: 'eur',
              receipt_email: email,
              metadata: {
                orderID: String(createdOrder.id),
                customerID:
                  typeof authenticatedUser?.id === 'number' ? String(authenticatedUser.id) : '',
                locale,
              },
              automatic_payment_methods: {
                enabled: true,
              },
            })

            await payload.update({
              collection: 'orders',
              id: createdOrder.id,
              overrideAccess: true,
              locale,
              data: {
                paymentProvider: 'stripe',
                paymentReference: paymentIntent.id,
              },
            })

            return NextResponse.json({
              ok: true,
              orderId: createdOrder.id,
              orderNumber: createdOrder.orderNumber,
              total,
              currency: 'EUR',
              emailSent: false,
              status: 'pending',
              paymentProvider: 'stripe',
              paymentIntentClientSecret: paymentIntent.client_secret,
              stripePublishableKey,
              checkoutMode: 'payment_element',
            })
          }

          const checkoutSession =
            checkoutMode === 'embedded'
              ? await stripe.checkout.sessions.create({
                  ...sessionPayloadBase,
                  line_items: stripeLineItems,
                  ui_mode: 'embedded',
                  return_url: `${baseUrl}/${locale}/checkout/success?order=${encodeURIComponent(createdOrder.orderNumber || '')}&session_id={CHECKOUT_SESSION_ID}`,
                })
              : await stripe.checkout.sessions.create({
                  ...sessionPayloadBase,
                  line_items: stripeLineItems,
                  success_url: `${baseUrl}/${locale}/checkout/success?order=${encodeURIComponent(createdOrder.orderNumber || '')}&session_id={CHECKOUT_SESSION_ID}`,
                  cancel_url: `${baseUrl}/${locale}/checkout`,
                })

          await payload.update({
            collection: 'orders',
            id: createdOrder.id,
            overrideAccess: true,
            locale,
            data: {
              paymentProvider: 'stripe',
              paymentReference: checkoutSession.id,
            },
          })

          return NextResponse.json({
            ok: true,
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            total,
            currency: 'EUR',
            emailSent: false,
            status: 'pending',
            paymentProvider: 'stripe',
            checkoutUrl: checkoutSession.url,
            checkoutClientSecret: checkoutSession.client_secret,
            stripePublishableKey,
            checkoutMode,
          })
        }

        if (checkoutMode === 'payment_element') {
          return NextResponse.json(
            { error: 'Stripe non configurato: manca secret key per Payment Element.' },
            { status: 500 },
          )
        }

        const autoCapture = process.env.SHOP_AUTO_CAPTURE !== 'false'
        let emailSent = false
        if (autoCapture) {
          await commitOrderInventory({
            payload,
            orderID: String(createdOrder.id),
            locale,
          })

          try {
            await sendSMTPEmail({
              payload,
              to: email,
              subject: `Conferma ordine ${createdOrder.orderNumber}`,
              text: [
                `Ciao ${firstName},`,
                '',
                `abbiamo ricevuto il tuo ordine ${createdOrder.orderNumber}.`,
                `Totale: EUR ${total.toFixed(2)}`,
                '',
                'Grazie,',
                'DOB Milano',
              ].join('\n'),
              html: `
              <p>Ciao ${firstName},</p>
              <p>abbiamo ricevuto il tuo ordine <strong>${createdOrder.orderNumber}</strong>.</p>
              <p>Totale: <strong>EUR ${total.toFixed(2)}</strong></p>
              <p>Grazie,<br/>DOB Milano</p>
            `,
            })
            emailSent = true
          } catch (emailError) {
            payload.logger.error({
              err: emailError,
              msg: `Order confirmation email failed for order ${createdOrder.orderNumber}`,
            })
          }
        }

        return NextResponse.json({
          ok: true,
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          total,
          currency: 'EUR',
          emailSent,
          status: process.env.SHOP_AUTO_CAPTURE !== 'false' ? 'paid' : 'pending',
          paymentProvider: 'manual',
        })
      } catch (error) {
        for (const [productId, previousAllocated] of rollbackAllocated.entries()) {
          try {
            await payload.update({
              collection: 'products',
              id: productId,
              overrideAccess: true,
              locale,
              data: {
                allocatedStock: previousAllocated,
              },
            })
          } catch {
            // No-op best effort rollback
          }
        }

        for (const itemID of createdItemIDs) {
          try {
            await payload.delete({
              collection: 'order-items',
              id: itemID,
              overrideAccess: true,
              locale,
            })
          } catch {
            // No-op best effort rollback
          }
        }

        await payload.delete({
          collection: 'orders',
          id: createdOrder.id,
          overrideAccess: true,
          locale,
        })

        throw error
      }
    } finally {
      await releaseInventoryLocks({
        payload,
        locks,
      })
    }
  } catch (error) {
    console.error('Checkout route error', error)
    return NextResponse.json({ error: GENERIC_CHECKOUT_ERROR }, { status: 500 })
  }
}
