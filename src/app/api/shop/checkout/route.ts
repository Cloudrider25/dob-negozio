import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

import { sendAdminNewOrderNotification } from '@/lib/server/email/businessNotifications'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { ensureAnagraficaForCustomer } from '@/lib/server/anagrafiche/ensureAnagraficaForCustomer'
import { isLocale, type Locale } from '@/lib/i18n/core'
import { sendSMTPEmail } from '@/lib/server/email/sendSMTPEmail'
import {
  allocateOrderInventory,
  commitOrderInventory,
  releaseOrderAllocation,
} from '@/lib/server/shop/orderInventory'
import { acquireInventoryLocks, releaseInventoryLocks } from '@/lib/server/shop/inventoryLocks'
import {
  calculateCommissionAmount,
  calculateDiscountAmount,
  distributeDiscountAcrossUnitAmounts,
  normalizePromoCodeInput,
  resolvePromoCode,
} from '@/lib/server/shop/promoCodes'
import { getShopIntegrationsConfig } from '@/lib/server/shop/shopIntegrationsConfig'
import { getSendcloudShippingOptions } from '@/lib/server/sendcloud/getShippingQuote'
import { isFreeShippingUnlocked } from '@/lib/shared/shop/shipping'
import type { Product, Service } from '@/payload/generated/payload-types'
import Stripe from 'stripe'

const GENERIC_CHECKOUT_ERROR = 'Si è verificato un errore durante il checkout. Riprova.'
const IDEMPOTENCY_WINDOW_MS = 20 * 60 * 1000
const STALE_ALLOCATION_WINDOW_MS = 15 * 60 * 1000

type CheckoutItemInput = {
  id: string
  quantity: number
}

type ParsedCartItemKey =
  | { kind: 'product'; sourceID: string; quantity: number; productID: string }
  | {
      kind: 'service'
      sourceID: string
      quantity: number
      serviceID: string
      serviceLineKind: 'service' | 'package'
      variantKey: string
    }

type CheckoutPayload = {
  locale?: string
  checkoutMode?: 'redirect' | 'embedded' | 'payment_element'
  discountCode?: string
  productFulfillmentMode?: 'shipping' | 'pickup' | 'none'
  serviceAppointment?: {
    mode?: 'requested_slot' | 'contact_later' | 'none'
    requestedDate?: string
    requestedTime?: string
  }
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
const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const parseCartItemKey = (id: string, quantity: number): ParsedCartItemKey => {
  const serviceMatch = id.match(/^(\d+):(service|package):(.+)$/)
  if (serviceMatch) {
    return {
      kind: 'service',
      sourceID: id,
      quantity,
      serviceID: serviceMatch[1],
      serviceLineKind: serviceMatch[2] as 'service' | 'package',
      variantKey: serviceMatch[3],
    }
  }
  return {
    kind: 'product',
    sourceID: id,
    quantity,
    productID: id,
  }
}

const toCartSignature = (items: ParsedCartItemKey[]) =>
  items
    .map((item) => {
      if (item.kind === 'product') return `p:${item.productID}:${item.quantity}`
      return `s:${item.serviceID}:${item.serviceLineKind}:${item.variantKey}:${item.quantity}`
    })
    .sort()
    .join('|')

const computeCheckoutFingerprint = ({
  locale,
  email,
  discountCode,
  productFulfillmentMode,
  shippingOptionID,
  appointmentMode,
  requestedAppointmentDate,
  requestedAppointmentTime,
  items,
}: {
  locale: string
  email: string
  discountCode: string
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  shippingOptionID: string
  appointmentMode: 'requested_slot' | 'contact_later' | 'none'
  requestedAppointmentDate: string
  requestedAppointmentTime: string
  items: ParsedCartItemKey[]
}) => {
  const normalizedItems = toCartSignature(items)

  const raw = [
    locale,
    email.toLowerCase(),
    discountCode,
    productFulfillmentMode,
    shippingOptionID,
    appointmentMode,
    requestedAppointmentDate,
    requestedAppointmentTime,
    normalizedItems,
  ].join('||')

  return createHash('sha256').update(raw).digest('hex')
}

const releaseStaleAllocationsForProducts = async ({
  payload,
  locale,
  productIDs,
}: {
  payload: Awaited<ReturnType<typeof getPayloadClient>>
  locale: Locale
  productIDs: string[]
}) => {
  if (productIDs.length === 0) return 0

  const cutoffISO = new Date(Date.now() - STALE_ALLOCATION_WINDOW_MS).toISOString()
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
  })

  if (staleOrders.docs.length === 0) return 0
  const staleOrderIDs = staleOrders.docs.map((doc) => String(doc.id))

  const staleOrderItems = await payload.find({
    collection: 'order-items',
    overrideAccess: true,
    depth: 0,
    limit: 1000,
    where: {
      and: [{ order: { in: staleOrderIDs } }, { product: { in: productIDs } }],
    },
    select: {
      order: true,
    },
  })

  const orderIDsToRelease = new Set<string>()
  for (const orderItem of staleOrderItems.docs) {
    const orderID =
      typeof orderItem.order === 'object' && orderItem.order && 'id' in orderItem.order
        ? String(orderItem.order.id)
        : String(orderItem.order)
    if (orderID) orderIDsToRelease.add(orderID)
  }

  let released = 0
  for (const orderID of orderIDsToRelease) {
    try {
      const didRelease = await releaseOrderAllocation({
        payload,
        orderID,
        locale,
      })
      if (didRelease) released += 1
    } catch {
      // Best-effort cleanup: release failures should not block checkout flow.
    }
  }

  return released
}

const getOrderCartSignature = async ({
  payload,
  orderID,
}: {
  payload: Awaited<ReturnType<typeof getPayloadClient>>
  orderID: string | number
}) => {
  const [orderItems, orderServiceItems] = await Promise.all([
    payload.find({
      collection: 'order-items',
      overrideAccess: true,
      depth: 0,
      limit: 500,
      where: {
        order: { equals: orderID },
      },
      select: {
        product: true,
        quantity: true,
      },
    }),
    payload.find({
      collection: 'order-service-items',
      overrideAccess: true,
      depth: 0,
      limit: 500,
      where: {
        order: { equals: orderID },
      },
      select: {
        service: true,
        itemKind: true,
        variantKey: true,
        quantity: true,
      },
    }),
  ])

  const parsed: ParsedCartItemKey[] = []

  for (const item of orderItems.docs) {
    const productRaw = item.product
    const productID =
      typeof productRaw === 'number'
        ? String(productRaw)
        : productRaw && typeof productRaw === 'object' && 'id' in productRaw
          ? String(productRaw.id)
          : ''
    const quantity = typeof item.quantity === 'number' ? Math.floor(item.quantity) : 0
    if (!productID || quantity <= 0) continue
    parsed.push({
      kind: 'product',
      sourceID: productID,
      productID,
      quantity,
    })
  }

  for (const item of orderServiceItems.docs) {
    const serviceRaw = item.service
    const serviceID =
      typeof serviceRaw === 'number'
        ? String(serviceRaw)
        : serviceRaw && typeof serviceRaw === 'object' && 'id' in serviceRaw
          ? String(serviceRaw.id)
          : ''
    const quantity = typeof item.quantity === 'number' ? Math.floor(item.quantity) : 0
    if (!serviceID || quantity <= 0) continue

    const itemKind = item.itemKind === 'package' ? 'package' : 'service'
    const variantKey = toString(item.variantKey) || 'default'
    parsed.push({
      kind: 'service',
      sourceID: `${serviceID}:${itemKind}:${variantKey}`,
      serviceID,
      serviceLineKind: itemKind,
      variantKey,
      quantity,
    })
  }

  return toCartSignature(parsed)
}

const resolveRequestedFulfillmentMode = (value: unknown): 'shipping' | 'pickup' | 'none' => {
  if (value === 'pickup') return 'pickup'
  if (value === 'none') return 'none'
  return 'shipping'
}

const resolveAppointmentMode = (value: unknown): 'requested_slot' | 'contact_later' | 'none' => {
  if (value === 'requested_slot') return 'requested_slot'
  if (value === 'contact_later') return 'contact_later'
  return 'none'
}

export async function POST(request: Request) {
  try {
    let body: CheckoutPayload
    try {
      body = (await request.json()) as CheckoutPayload
    } catch {
      return NextResponse.json({ error: 'Payload checkout non valido.' }, { status: 400 })
    }
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
    const discountCode = toString(body.discountCode)

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email non valida.' }, { status: 400 })
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

    const parsedCartItems = Array.from(normalized.entries()).map(([id, quantity]) => parseCartItemKey(id, quantity))
    const productIds = parsedCartItems
      .filter((item): item is Extract<ParsedCartItemKey, { kind: 'product' }> => item.kind === 'product')
      .map((item) => item.productID)
    const serviceIds = Array.from(
      new Set(
        parsedCartItems
          .filter((item): item is Extract<ParsedCartItemKey, { kind: 'service' }> => item.kind === 'service')
          .map((item) => item.serviceID),
      ),
    )
    const hasProducts = productIds.length > 0
    const hasServices = serviceIds.length > 0
    const cartMode: 'products_only' | 'services_only' | 'mixed' = hasProducts
      ? hasServices
        ? 'mixed'
        : 'products_only'
      : 'services_only'
    const requestedFulfillmentMode = resolveRequestedFulfillmentMode(body.productFulfillmentMode)
    const appointmentMode = resolveAppointmentMode(body.serviceAppointment?.mode)
    const requestedAppointmentDate = toString(body.serviceAppointment?.requestedDate)
    const requestedAppointmentTime = toString(body.serviceAppointment?.requestedTime)
    const appointmentDateISO =
      requestedAppointmentDate && !Number.isNaN(new Date(requestedAppointmentDate).getTime())
        ? new Date(requestedAppointmentDate).toISOString()
        : ''
    const productFulfillmentMode: 'shipping' | 'pickup' | 'none' = hasProducts
      ? requestedFulfillmentMode === 'pickup'
        ? 'pickup'
        : 'shipping'
      : 'none'
    const requiresShippingAddress = productFulfillmentMode === 'shipping'
    const requiresServiceAppointment = hasServices

    if (requiresServiceAppointment && appointmentMode === 'requested_slot') {
      if (!appointmentDateISO || !requestedAppointmentTime) {
        return NextResponse.json(
          { error: 'Seleziona data e ora preferita per i servizi.' },
          { status: 400 },
        )
      }
    }

    if (!isPaymentElementMode) {
      if (!firstName || !lastName) {
        return NextResponse.json({ error: 'Compila i dati anagrafici obbligatori.' }, { status: 400 })
      }
      if (requiresShippingAddress && (!address || !postalCode || !city || !province)) {
        return NextResponse.json(
          { error: 'Compila tutti i campi obbligatori di spedizione.' },
          { status: 400 },
        )
      }
    }
    let locks: Awaited<ReturnType<typeof acquireInventoryLocks>> = []
    const requestedCartSignature = toCartSignature(parsedCartItems)
    const checkoutFingerprint = computeCheckoutFingerprint({
      locale,
      email,
      discountCode: normalizePromoCodeInput(discountCode),
      productFulfillmentMode,
      shippingOptionID,
      appointmentMode,
      requestedAppointmentDate,
      requestedAppointmentTime,
      items: parsedCartItems,
    })

    if (checkoutMode === 'payment_element') {
      const existingResult = await payload.find({
        collection: 'orders',
        overrideAccess: true,
        depth: 0,
        limit: 20,
        sort: '-createdAt',
        where: {
          and: [
            { customerEmail: { equals: email } },
            { paymentProvider: { equals: 'stripe' } },
            { status: { equals: 'pending' } },
            { paymentStatus: { equals: 'pending' } },
            { inventoryCommitted: { equals: false } },
            { allocationReleased: { equals: false } },
            {
              createdAt: {
                greater_than: new Date(Date.now() - IDEMPOTENCY_WINDOW_MS).toISOString(),
              },
            },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          paymentReference: true,
          promoCodeValue: true,
          discountAmount: true,
          total: true,
          currency: true,
        },
      })

      let existingOrder: (typeof existingResult.docs)[number] | undefined
      const requestedPromoCode = normalizePromoCodeInput(discountCode)
      for (const candidate of existingResult.docs) {
        const candidateSignature = await getOrderCartSignature({
          payload,
          orderID: candidate.id,
        })
        const candidatePromoCode = normalizePromoCodeInput(candidate.promoCodeValue)
        if (candidateSignature === requestedCartSignature && candidatePromoCode === requestedPromoCode) {
          existingOrder = candidate
          break
        }
      }

      const existingPaymentReference = toString(existingOrder?.paymentReference)
      if (existingOrder && existingPaymentReference.startsWith('pi_')) {
        const integrations = await getShopIntegrationsConfig(payload)
        const stripeSecret = integrations.stripe.secretKey
        const stripePublishableKey = integrations.stripe.publishableKey
        if (stripeSecret && stripePublishableKey) {
          const stripe = new Stripe(stripeSecret, {
            apiVersion: '2026-01-28.clover',
          })
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(existingPaymentReference)
            if (paymentIntent.client_secret && paymentIntent.status !== 'canceled') {
              return NextResponse.json({
                ok: true,
                orderId: existingOrder.id,
                orderNumber: existingOrder.orderNumber,
                total: typeof existingOrder.total === 'number' ? existingOrder.total : undefined,
                discountAmount:
                  typeof existingOrder.discountAmount === 'number'
                    ? existingOrder.discountAmount
                    : undefined,
                currency:
                  typeof existingOrder.currency === 'string' ? existingOrder.currency : 'EUR',
                paymentProvider: 'stripe',
                paymentIntentClientSecret: paymentIntent.client_secret,
                stripePublishableKey,
                checkoutMode: 'payment_element',
                reused: true,
              })
            }
          } catch (reuseError) {
            payload.logger.warn({
              err: reuseError,
              msg: `Unable to reuse Stripe payment intent for order ${String(existingOrder.id)}.`,
            })
          }
        }
      }
    }

    if (productIds.length > 0) {
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
          {
            error:
              'Checkout già in elaborazione per questo carrello. Attendi qualche secondo e riprova una sola volta.',
          },
          { status: 409 },
        )
      }
    }

    try {
      const productsResult =
        productIds.length > 0
          ? await payload.find({
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
          : { docs: [] as Product[] }

      const productsById = new Map(productsResult.docs.map((doc) => [String(doc.id), doc]))
      const missingProducts = productIds.filter((id) => !productsById.has(id))
      if (missingProducts.length > 0) {
        return NextResponse.json(
          { error: 'Alcuni prodotti non sono più disponibili.', missing: missingProducts },
          { status: 409 },
        )
      }

      const servicesResult =
        serviceIds.length > 0
          ? await payload.find({
              collection: 'services',
              limit: serviceIds.length,
              depth: 0,
              overrideAccess: false,
              locale,
              where: {
                and: [{ id: { in: serviceIds } }, { active: { equals: true } }],
              },
              select: {
                id: true,
                name: true,
                price: true,
                durationMinutes: true,
                nomeVariabile: true,
                variabili: true,
                pacchetti: true,
                active: true,
              },
            })
          : { docs: [] as Service[] }

      const servicesById = new Map(servicesResult.docs.map((doc) => [String(doc.id), doc]))
      const missingServices = serviceIds.filter((id) => !servicesById.has(id))
      if (missingServices.length > 0) {
        return NextResponse.json(
          { error: 'Alcuni servizi non sono più disponibili.', missing: missingServices },
          { status: 409 },
        )
      }

      type ProductLineItem = {
        product: Product
        quantity: number
        unitPrice: number
        lineTotal: number
        available: number
      }
      type ServiceLineItem = {
        service: Service
        quantity: number
        unitPrice: number
        lineTotal: number
        title: string
        itemKind: 'service' | 'package'
        variantKey: string
        variantLabel: string | null
        durationMinutes: number | null
        sessions: number | null
      }
      type CheckoutLineItem = {
        quantity: number
        unitPrice: number
        lineTotal: number
        stripeName: string
        eligibleForDiscount: boolean
      }

      const productLineItems: ProductLineItem[] = []
      const serviceLineItems: ServiceLineItem[] = []
      let staleReleaseAttempted = false

      for (const item of parsedCartItems) {
        if (item.kind === 'product') {
          let product = productsById.get(item.productID)
          if (!product) continue
          if (typeof product.price !== 'number' || product.price < 0) {
            return NextResponse.json(
              { error: `Prezzo non valido per il prodotto ${product.title || item.productID}.` },
              { status: 409 },
            )
          }
          const stock = typeof product.stock === 'number' ? product.stock : 0
          const allocated = typeof product.allocatedStock === 'number' ? product.allocatedStock : 0
          const available = Math.max(0, stock - allocated)
          if (item.quantity > available) {
            if (!staleReleaseAttempted) {
              staleReleaseAttempted = true
              const released = await releaseStaleAllocationsForProducts({
                payload,
                locale,
                productIDs: productIds,
              })

              if (released > 0) {
                const refreshed = await payload.findByID({
                  collection: 'products',
                  id: item.productID,
                  overrideAccess: false,
                  locale,
                  depth: 0,
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

                if (refreshed && refreshed.active) {
                  productsById.set(item.productID, refreshed as Product)
                  product = refreshed as Product
                }
              }
            }

            const latestStock = typeof product.stock === 'number' ? product.stock : 0
            const latestAllocated =
              typeof product.allocatedStock === 'number' ? product.allocatedStock : 0
            const latestAvailable = Math.max(0, latestStock - latestAllocated)
            if (item.quantity <= latestAvailable) {
              productLineItems.push({
                product,
                quantity: item.quantity,
                unitPrice: product.price,
                lineTotal: product.price * item.quantity,
                available: latestAvailable,
              })
              continue
            }

            return NextResponse.json(
              {
                error: `Disponibilità insufficiente per ${product.title || item.productID}.`,
                productId: item.productID,
                requested: item.quantity,
                available: latestAvailable,
              },
              { status: 409 },
            )
          }
          productLineItems.push({
            product,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal: product.price * item.quantity,
            available,
          })
          continue
        }

        const service = servicesById.get(item.serviceID)
        if (!service) continue

        if (item.serviceLineKind === 'package') {
          const pkg = Array.isArray(service.pacchetti)
            ? service.pacchetti.find((entry) => String(entry?.id ?? '') === item.variantKey)
            : null
          if (!pkg || typeof pkg.prezzoPacchetto !== 'number' || pkg.prezzoPacchetto < 0) {
            return NextResponse.json(
              { error: `Pacchetto non valido per il servizio ${service.name || item.serviceID}.` },
              { status: 409 },
            )
          }
          serviceLineItems.push({
            service,
            quantity: item.quantity,
            unitPrice: pkg.prezzoPacchetto,
            lineTotal: pkg.prezzoPacchetto * item.quantity,
            title: pkg.nomePacchetto || `Pacchetto ${service.name || item.serviceID}`,
            itemKind: 'package',
            variantKey: item.variantKey,
            variantLabel: pkg.nomePacchetto || null,
            durationMinutes: null,
            sessions:
              typeof pkg.numeroSedute === 'number' && Number.isFinite(pkg.numeroSedute)
                ? pkg.numeroSedute
                : null,
          })
          continue
        }

        let optionName = (typeof service.nomeVariabile === 'string' && service.nomeVariabile.trim()) || 'Default'
        let optionDuration =
          typeof service.durationMinutes === 'number' && Number.isFinite(service.durationMinutes)
            ? service.durationMinutes
            : null
        let optionPrice: number | null =
          typeof service.price === 'number' && Number.isFinite(service.price) ? service.price : null

        const variantMatch = item.variantKey.match(/^variabile:(\d+)$/)
        if (variantMatch) {
          const variantIndex = Number(variantMatch[1])
          const variant =
            Array.isArray(service.variabili) && Number.isFinite(variantIndex) && variantIndex >= 0
              ? service.variabili[variantIndex]
              : null
          if (!variant || typeof variant.varPrice !== 'number' || variant.varPrice < 0) {
            return NextResponse.json(
              { error: `Variante non valida per il servizio ${service.name || item.serviceID}.` },
              { status: 409 },
            )
          }
          optionName =
            (typeof variant.varNome === 'string' && variant.varNome.trim()) || `Variabile ${variantIndex + 1}`
          optionDuration =
            typeof variant.varDurationMinutes === 'number' && Number.isFinite(variant.varDurationMinutes)
              ? variant.varDurationMinutes
              : optionDuration
          optionPrice = variant.varPrice
        }

        if (typeof optionPrice !== 'number' || optionPrice < 0) {
          return NextResponse.json(
            { error: `Prezzo non valido per il servizio ${service.name || item.serviceID}.` },
            { status: 409 },
          )
        }

        const durationSuffix = optionDuration ? ` ${optionDuration} min` : ''
        serviceLineItems.push({
          service,
          quantity: item.quantity,
          unitPrice: optionPrice,
          lineTotal: optionPrice * item.quantity,
          title: `${service.name} ${optionName}${durationSuffix}`.trim(),
          itemKind: 'service',
          variantKey: item.variantKey,
          variantLabel: optionName,
          durationMinutes: optionDuration,
          sessions: null,
        })
      }

      const productSubtotal = roundCurrency(
        productLineItems.reduce((sum, item) => sum + item.lineTotal, 0),
      )
      const productItemsCount = productLineItems.reduce((sum, item) => sum + item.quantity, 0)
      const serviceSubtotal = roundCurrency(
        serviceLineItems.reduce((sum, item) => sum + item.lineTotal, 0),
      )
      const subtotal = roundCurrency(productSubtotal + serviceSubtotal)
      let shippingAmount = 0
      if (
        productFulfillmentMode === 'shipping' &&
        productSubtotal > 0 &&
        !isFreeShippingUnlocked(productSubtotal) &&
        (!isPaymentElementMode || hasShippingAddressInput)
      ) {
        const shippingOptions = await getSendcloudShippingOptions({
          payload,
          toCountry: 'IT',
          toPostalCode: postalCode,
          itemsCount: productItemsCount,
        })
        if (shippingOptions.length > 0) {
          const selectedOption =
            shippingOptions.find((option) => option.id === shippingOptionID) || shippingOptions[0]
          shippingAmount = roundCurrency(selectedOption.amount)
        }
      }
      let resolvedPromoCode: Awaited<ReturnType<typeof resolvePromoCode>> = null
      if (discountCode) {
        try {
          resolvedPromoCode = await resolvePromoCode({
            payload,
            discountCode,
            hasProducts,
            hasServices,
          })
        } catch (promoError) {
          return NextResponse.json(
            {
              error:
                promoError instanceof Error
                  ? promoError.message
                  : 'Il codice sconto non è valido.',
            },
            { status: 409 },
          )
        }

        if (!resolvedPromoCode) {
          return NextResponse.json({ error: 'Il codice sconto non è valido.' }, { status: 409 })
        }
      }

      const eligibleSubtotal = roundCurrency(
        (resolvedPromoCode?.appliesToProducts ? productSubtotal : 0) +
          (resolvedPromoCode?.appliesToServices ? serviceSubtotal : 0),
      )
      const discountAmount = resolvedPromoCode
        ? calculateDiscountAmount({
            amountType: resolvedPromoCode.discountType,
            amountValue: resolvedPromoCode.discountValue,
            eligibleSubtotal,
          })
        : 0
      const eligibleNetAfterDiscount = roundCurrency(Math.max(0, eligibleSubtotal - discountAmount))
      const commissionAmount = resolvedPromoCode
        ? calculateCommissionAmount({
            commissionType: resolvedPromoCode.commissionType,
            commissionValue: resolvedPromoCode.commissionValue,
            eligibleNetAfterDiscount,
          })
        : 0
      const total = roundCurrency(Math.max(0, subtotal + shippingAmount - discountAmount))
      const checkoutLineItems: CheckoutLineItem[] = [
        ...productLineItems.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          stripeName: item.product.title || String(item.product.id),
          eligibleForDiscount: resolvedPromoCode?.appliesToProducts === true,
        })),
        ...serviceLineItems.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          stripeName: item.title,
          eligibleForDiscount: resolvedPromoCode?.appliesToServices === true,
        })),
      ]
      const checkoutUnitLineItems = checkoutLineItems.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          stripeName: item.stripeName,
          unitPrice: item.unitPrice,
          eligibleForDiscount: item.eligibleForDiscount,
        })),
      )
      const discountedUnitPrices = distributeDiscountAcrossUnitAmounts({
        unitAmounts: checkoutUnitLineItems
          .filter((item) => item.eligibleForDiscount)
          .map((item) => item.unitPrice),
        discountAmount,
      })
      let discountedUnitPriceIndex = 0
      const stripeCheckoutLineItems = checkoutUnitLineItems.map((item) => {
        if (!item.eligibleForDiscount) {
          return {
            quantity: 1,
            unitPrice: item.unitPrice,
            stripeName: item.stripeName,
          }
        }

        const unitPrice = discountedUnitPrices[discountedUnitPriceIndex] ?? item.unitPrice
        discountedUnitPriceIndex += 1

        return {
          quantity: 1,
          unitPrice,
          stripeName: item.stripeName,
        }
      })

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
        cartMode,
        productFulfillmentMode,
        appointmentMode: hasServices ? appointmentMode : 'none',
        appointmentStatus: hasServices
          ? appointmentMode === 'none'
            ? 'pending'
            : 'pending'
          : 'none',
        appointmentRequestedDate:
          hasServices && appointmentMode === 'requested_slot'
            ? appointmentDateISO
            : undefined,
        appointmentRequestedTime:
          hasServices && appointmentMode === 'requested_slot' ? requestedAppointmentTime : undefined,
        subtotal,
        shippingAmount,
        discountAmount,
        commissionAmount,
        total,
        promoCode: resolvedPromoCode?.promoCodeID,
        promoCodeValue: resolvedPromoCode?.promoCodeValue,
        partner: resolvedPromoCode?.partnerID,
        commissionStatus: resolvedPromoCode && commissionAmount > 0 ? 'pending' : undefined,
        promoCodeSnapshot: resolvedPromoCode
          ? {
              code: resolvedPromoCode.promoCodeValue,
              partnerName: resolvedPromoCode.partnerName,
              discountType: resolvedPromoCode.discountType,
              discountValue: resolvedPromoCode.discountValue,
              commissionType: resolvedPromoCode.commissionType,
              commissionValue: resolvedPromoCode.commissionValue,
              appliesToProducts: resolvedPromoCode.appliesToProducts,
              appliesToServices: resolvedPromoCode.appliesToServices,
            }
          : undefined,
        customerEmail: email,
        customer: typeof authenticatedUser?.id === 'number' ? authenticatedUser.id : undefined,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone || undefined,
        shippingAddress: {
          address: requiresShippingAddress ? address : 'Ritiro in negozio / N/A',
          postalCode: requiresShippingAddress ? postalCode : '00000',
          city: requiresShippingAddress ? city : 'Milano',
          province: requiresShippingAddress ? province : 'MI',
          country: 'Italy',
        },
      },
    })

      if (authenticatedUser) {
        await ensureAnagraficaForCustomer(payload, authenticatedUser, { locale })
      }

      const rollbackAllocated = new Map<string, number>()
      const createdItemIDs: Array<string | number> = []
      const createdServiceItemIDs: Array<string | number> = []
      const createdServiceSessionIDs: Array<string | number> = []

      try {
        for (const item of productLineItems) {
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

        for (const item of serviceLineItems) {
          const createdServiceItem = await payload.create({
            collection: 'order-service-items',
            overrideAccess: true,
            locale,
            draft: false,
            data: {
              order: createdOrder.id,
              service: item.service.id,
              itemKind: item.itemKind,
              variantKey: item.variantKey,
              variantLabel: item.variantLabel || undefined,
              serviceTitle: item.title,
              serviceSlug: item.service.slug || undefined,
              durationMinutes: item.durationMinutes ?? undefined,
              sessions: item.sessions ?? undefined,
              appointmentMode: hasServices ? appointmentMode : 'none',
              appointmentStatus: hasServices ? 'pending' : 'none',
              appointmentRequestedDate:
                hasServices && appointmentMode === 'requested_slot' ? appointmentDateISO : undefined,
              appointmentRequestedTime:
                hasServices && appointmentMode === 'requested_slot'
                  ? requestedAppointmentTime
                  : undefined,
              currency: 'EUR',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            },
          })
          createdServiceItemIDs.push(createdServiceItem.id)

          const sessionsTotal = Math.max(1, item.itemKind === 'package' ? (item.sessions ?? 1) : 1)
          const sessionPrice = roundCurrency(
            sessionsTotal > 0 ? item.lineTotal / sessionsTotal : item.lineTotal,
          )
          for (let sessionIndex = 1; sessionIndex <= sessionsTotal; sessionIndex += 1) {
            const createdSession = await payload.create({
              collection: 'order-service-sessions',
              overrideAccess: true,
              locale,
              draft: false,
              data: {
                order: createdOrder.id,
                orderServiceItem: createdServiceItem.id,
                service: item.service.id,
                itemKind: item.itemKind,
                variantKey: item.variantKey,
                variantLabel: item.variantLabel || undefined,
                sessionIndex,
                sessionLabel: item.itemKind === 'package' ? `Seduta ${sessionIndex}` : 'Seduta unica',
                sessionsTotal,
                appointmentMode: hasServices ? appointmentMode : 'none',
                appointmentStatus: hasServices ? 'pending' : 'none',
                appointmentRequestedDate:
                  hasServices && appointmentMode === 'requested_slot' ? appointmentDateISO : undefined,
                appointmentRequestedTime:
                  hasServices && appointmentMode === 'requested_slot'
                    ? requestedAppointmentTime
                    : undefined,
                serviceTitle: item.title,
                serviceSlug: item.service.slug || undefined,
                durationMinutes: item.durationMinutes ?? undefined,
                currency: 'EUR',
                sessionPrice,
              },
            })
            createdServiceSessionIDs.push(createdSession.id)
          }
        }

        if (productLineItems.length > 0) {
          await allocateOrderInventory({
            payload,
            orderID: String(createdOrder.id),
            locale,
          })
        }

        const integrations = await getShopIntegrationsConfig(payload)
        const stripeSecret = integrations.stripe.secretKey
        const stripePublishableKey = integrations.stripe.publishableKey
        const isStripeEnabled = stripeSecret.length > 0

        if (isStripeEnabled) {
          const stripeKeyPrefix = `${checkoutFingerprint}:${createdOrder.id}`
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
              promoCode: resolvedPromoCode?.promoCodeValue || '',
              partnerID: resolvedPromoCode ? String(resolvedPromoCode.partnerID) : '',
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
                promoCode: resolvedPromoCode?.promoCodeValue || '',
                partnerID: resolvedPromoCode ? String(resolvedPromoCode.partnerID) : '',
              },
            },
            line_items: stripeCheckoutLineItems.map((item) => ({
              quantity: item.quantity,
              price_data: {
                currency: 'eur',
                unit_amount: toStripeAmount(item.unitPrice),
                product_data: {
                  name: item.stripeName,
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
            const paymentIntentIdempotencyKey = `${stripeKeyPrefix}:pi`
            const paymentIntent = await stripe.paymentIntents.create({
              amount: toStripeAmount(total),
              currency: 'eur',
              receipt_email: email,
              metadata: {
                orderID: String(createdOrder.id),
                customerID:
                  typeof authenticatedUser?.id === 'number' ? String(authenticatedUser.id) : '',
                locale,
                promoCode: resolvedPromoCode?.promoCodeValue || '',
                partnerID: resolvedPromoCode ? String(resolvedPromoCode.partnerID) : '',
              },
              automatic_payment_methods: {
                enabled: true,
              },
            }, {
              idempotencyKey: paymentIntentIdempotencyKey,
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
              discountAmount,
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
                }, {
                  idempotencyKey: `${stripeKeyPrefix}:embedded`,
                })
              : await stripe.checkout.sessions.create({
                  ...sessionPayloadBase,
                  line_items: stripeLineItems,
                  success_url: `${baseUrl}/${locale}/checkout/success?order=${encodeURIComponent(createdOrder.orderNumber || '')}&session_id={CHECKOUT_SESSION_ID}`,
                  cancel_url: `${baseUrl}/${locale}/checkout`,
                }, {
                  idempotencyKey: `${stripeKeyPrefix}:redirect`,
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
            discountAmount,
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

          await sendAdminNewOrderNotification({
            payload,
            orderNumber: createdOrder.orderNumber,
            customerEmail: email,
            customerFirstName: firstName,
            customerLastName: lastName,
            total,
            cartMode,
            productFulfillmentMode,
            appointmentMode: hasServices ? appointmentMode : 'none',
            appointmentRequestedDate: hasServices && appointmentMode === 'requested_slot' ? appointmentDateISO : null,
            appointmentRequestedTime:
              hasServices && appointmentMode === 'requested_slot' ? requestedAppointmentTime : null,
          })
        }

        return NextResponse.json({
          ok: true,
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          total,
          discountAmount,
          currency: 'EUR',
          emailSent,
          status: process.env.SHOP_AUTO_CAPTURE !== 'false' ? 'paid' : 'pending',
          paymentProvider: 'manual',
        })
      } catch (error) {
        for (const [productId, previousAllocated] of rollbackAllocated.entries()) {
          try {
            const rollbackProduct = await payload.findByID({
              collection: 'products',
              id: productId,
              overrideAccess: true,
              locale,
              depth: 0,
              select: {
                title: true,
                slug: true,
                price: true,
                badgeSource: true,
              },
            })

            await payload.update({
              collection: 'products',
              id: productId,
              overrideAccess: true,
              locale,
              data: {
                title: rollbackProduct.title,
                slug: rollbackProduct.slug,
                price: rollbackProduct.price,
                badgeSource: rollbackProduct.badgeSource || 'brand',
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

        for (const sessionID of createdServiceSessionIDs) {
          try {
            await payload.delete({
              collection: 'order-service-sessions',
              id: sessionID,
              overrideAccess: true,
              locale,
            })
          } catch {
            // No-op best effort rollback
          }
        }

        for (const itemID of createdServiceItemIDs) {
          try {
            await payload.delete({
              collection: 'order-service-items',
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
