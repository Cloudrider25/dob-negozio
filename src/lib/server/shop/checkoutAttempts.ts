import { Client } from 'pg'
import type { Payload } from 'payload'

import type { Locale } from '@/lib/i18n/core'
import { commitOrderInventory, releaseInventoryQuantities, reserveInventoryQuantities, type InventoryQuantity } from '@/lib/server/shop/orderInventory'

type ShippingAddressSnapshot = {
  address?: string
  postalCode?: string
  city?: string
  province?: string
  country?: string
}

export type CheckoutAttemptProductItem = {
  productID: string
  productTitle: string
  productSlug?: string | null
  productBrand?: string | null
  productCoverImage?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type CheckoutAttemptServiceItem = {
  serviceID?: string | null
  programID?: string | null
  serviceTitle: string
  serviceSlug?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
  itemKind: 'service' | 'package' | 'program'
  variantKey: string
  variantLabel?: string | null
  durationMinutes?: number | null
  sessions?: number | null
  programStepsSnapshot?: Array<{
    stepType: 'manual' | 'service' | 'product'
    title?: string | null
    referenceTitle?: string | null
    referenceSlug?: string | null
  }> | null
}

export type CheckoutAttemptRecord = {
  id: number | string
  locale?: string | null
  customer?: number | { id?: number | string } | null
  customerEmail?: string | null
  customerFirstName?: string | null
  customerLastName?: string | null
  customerPhone?: string | null
  productFulfillmentMode?: 'shipping' | 'pickup' | 'none' | null
  appointmentMode?: 'requested_slot' | 'contact_later' | 'none' | null
  appointmentRequestedDate?: string | null
  appointmentRequestedTime?: string | null
  subtotal?: number | null
  shippingAmount?: number | null
  discountAmount?: number | null
  commissionAmount?: number | null
  total?: number | null
  promoCode?: number | { id?: number | string } | null
  partner?: number | { id?: number | string } | null
  promoCodeValue?: string | null
  promoCodeSnapshot?: unknown
  shippingAddress?: unknown
  paymentReference?: string | null
  paymentProvider?: string | null
  productItems?: unknown
  serviceItems?: unknown
  order?: number | { id?: number | string } | null
  inventoryReserved?: boolean | null
  inventoryReleased?: boolean | null
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const asNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

const normalizeEnvValue = (value: string | undefined): string => value?.trim() ?? ''

const isUsableDatabaseUrl = (value: string | undefined): value is string => {
  const normalized = normalizeEnvValue(value)
  if (!normalized) return false

  try {
    const parsed = new URL(normalized)
    return Boolean(parsed.hostname.trim())
  } catch {
    return false
  }
}

const isLocalDatabaseHost = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.trim().toLowerCase()
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  } catch {
    return false
  }
}

type DatabaseTargetEnv = 'local' | 'staging' | 'production'

const appEnv = process.env.APP_ENV?.trim().toLowerCase()
const isVercelProduction = process.env.VERCEL_ENV === 'production'
const isVercelPreview = process.env.VERCEL_ENV === 'preview'
const databaseTargetEnv: DatabaseTargetEnv =
  appEnv === 'production' || appEnv === 'prod'
    ? 'production'
    : appEnv === 'staging'
      ? 'staging'
      : isVercelProduction
        ? 'production'
        : isVercelPreview || process.env.CI === 'true'
          ? 'staging'
          : 'local'

const pickDatabaseUrl = (candidates: Array<string | undefined>, requireLocalHost: boolean) => {
  for (const candidate of candidates) {
    if (!isUsableDatabaseUrl(candidate)) continue
    if (requireLocalHost && !isLocalDatabaseHost(candidate)) continue
    return normalizeEnvValue(candidate)
  }

  return ''
}

const getRuntimeDatabaseUrl = () => {
  if (databaseTargetEnv === 'production') {
    return pickDatabaseUrl(
      [
        process.env.PROD_POSTGRES_URL,
        process.env.PROD_DATABASE_URL,
        process.env.PRODUCTION_DATABASE_URL,
        process.env.PROD_PRISMA_DATABASE_URL,
      ],
      false,
    )
  }

  if (databaseTargetEnv === 'staging') {
    return pickDatabaseUrl(
      [
        process.env.STG_POSTGRES_URL,
        process.env.STG_DATABASE_URL,
        process.env.STAGING_DATABASE_URL,
        process.env.STG_PRISMA_DATABASE_URL,
      ],
      false,
    )
  }

  return pickDatabaseUrl(
    [
      process.env.LOCAL_DATABASE_URL,
      process.env.DEV_DATABASE_URL,
      process.env.DATABASE_URL,
      process.env.POSTGRES_URL,
      process.env.POSTGRES_URL_NON_POOLING,
      process.env.POSTGRES_PRISMA_URL,
    ],
    true,
  )
}

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

const getRelationId = (value: unknown): number | string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return undefined
}

const getNumericRelationId = (value: unknown): number | undefined => {
  const relationID = getRelationId(value)
  if (typeof relationID === 'number' && Number.isFinite(relationID)) return relationID
  if (typeof relationID === 'string' && relationID.trim() !== '') {
    const parsed = Number(relationID)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const getNumericAttemptId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.floor(parsed)
  }
  return undefined
}

const readShippingAddress = (value: unknown): ShippingAddressSnapshot | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const data = value as Record<string, unknown>
  return {
    address: asString(data.address) || undefined,
    postalCode: asString(data.postalCode) || undefined,
    city: asString(data.city) || undefined,
    province: asString(data.province) || undefined,
    country: asString(data.country) || undefined,
  }
}

const readProductItems = (value: unknown): CheckoutAttemptProductItem[] =>
  Array.isArray(value)
    ? value
        .map((entry) => (entry && typeof entry === 'object' ? (entry as CheckoutAttemptProductItem) : null))
        .filter((entry): entry is CheckoutAttemptProductItem => Boolean(entry))
    : []

const readServiceItems = (value: unknown): CheckoutAttemptServiceItem[] =>
  Array.isArray(value)
    ? value
        .map((entry) => (entry && typeof entry === 'object' ? (entry as CheckoutAttemptServiceItem) : null))
        .filter((entry): entry is CheckoutAttemptServiceItem => Boolean(entry))
    : []

const toInventoryQuantities = (productItems: CheckoutAttemptProductItem[]): InventoryQuantity[] =>
  productItems
    .map((item) => ({
      productID: String(item.productID),
      quantity:
        typeof item.quantity === 'number' && Number.isFinite(item.quantity)
          ? Math.max(0, Math.floor(item.quantity))
          : 0,
    }))
    .filter((item) => item.productID && item.quantity > 0)

export const reserveCheckoutAttemptInventory = async ({
  payload,
  locale,
  productItems,
}: {
  payload: Payload
  locale: Locale
  productItems: CheckoutAttemptProductItem[]
}) => {
  const quantities = toInventoryQuantities(productItems)
  if (!quantities.length) return false

  await reserveInventoryQuantities({
    payload,
    locale,
    quantities,
  })

  return true
}

export const releaseCheckoutAttemptInventory = async ({
  payload,
  locale,
  productItems,
}: {
  payload: Payload
  locale: Locale
  productItems: CheckoutAttemptProductItem[]
}) => {
  const quantities = toInventoryQuantities(productItems)
  if (!quantities.length) return false

  await releaseInventoryQuantities({
    payload,
    locale,
    quantities,
  })

  return true
}

export const createOrderFromCheckoutAttempt = async ({
  payload,
  locale,
  attempt,
}: {
  payload: Payload
  locale: Locale
  attempt: CheckoutAttemptRecord
}) => {
  const attemptID = getNumericAttemptId(attempt.id)
  const connectionString = getRuntimeDatabaseUrl()
  const lockClient =
    attemptID && connectionString ? new Client({ connectionString }) : null

  try {
    if (lockClient && attemptID) {
      await lockClient.connect()
      await lockClient.query('select pg_advisory_lock($1, $2)', [3150315, attemptID])
    }

    const lockedAttempt = await payload.findByID({
      collection: 'checkout-attempts',
      id: attempt.id,
      overrideAccess: true,
      locale,
      depth: 0,
    })

    const existingOrderID = getRelationId(lockedAttempt.order)
    if (existingOrderID) {
      const order = await payload.findByID({
        collection: 'orders',
        id: existingOrderID,
        overrideAccess: true,
        locale,
        depth: 0,
      })
      return { order, created: false }
    }

    const productItems = readProductItems(lockedAttempt.productItems)
    const serviceItems = readServiceItems(lockedAttempt.serviceItems)
    const customerID = getNumericRelationId(lockedAttempt.customer)
    const promoCodeID = getNumericRelationId(lockedAttempt.promoCode)
    const partnerID = getNumericRelationId(lockedAttempt.partner)
    const paymentReference = asString(lockedAttempt.paymentReference)
    const paymentProvider = asString(lockedAttempt.paymentProvider) || 'stripe'
    const shippingAddress = readShippingAddress(lockedAttempt.shippingAddress)

    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      locale,
      draft: false,
      data: {
        orderNumber: createOrderNumber(),
        status: 'pending',
        paymentStatus: 'pending',
        paymentProvider,
        paymentReference,
        inventoryCommitted: false,
        allocationReleased: false,
        currency: 'EUR',
        locale,
        cartMode:
          productItems.length > 0 && serviceItems.length > 0
            ? 'mixed'
            : productItems.length > 0
              ? 'products_only'
              : 'services_only',
        productFulfillmentMode: lockedAttempt.productFulfillmentMode || 'none',
        appointmentMode: lockedAttempt.appointmentMode || 'none',
        appointmentStatus:
          lockedAttempt.appointmentMode && lockedAttempt.appointmentMode !== 'none' ? 'pending' : 'none',
        appointmentRequestedDate: lockedAttempt.appointmentRequestedDate || undefined,
        appointmentRequestedTime: lockedAttempt.appointmentRequestedTime || undefined,
        subtotal: asNumber(lockedAttempt.subtotal),
        shippingAmount: asNumber(lockedAttempt.shippingAmount),
        discountAmount: asNumber(lockedAttempt.discountAmount),
        commissionAmount: asNumber(lockedAttempt.commissionAmount),
        total: asNumber(lockedAttempt.total),
        promoCode: promoCodeID,
        promoCodeValue: asString(lockedAttempt.promoCodeValue) || undefined,
        partner: partnerID,
        commissionStatus:
          asNumber(lockedAttempt.commissionAmount) > 0 ? 'pending' : undefined,
        promoCodeSnapshot:
          lockedAttempt.promoCodeSnapshot && typeof lockedAttempt.promoCodeSnapshot === 'object'
            ? (lockedAttempt.promoCodeSnapshot as Record<string, unknown>)
            : undefined,
        customer: customerID,
        customerEmail: asString(lockedAttempt.customerEmail),
        customerFirstName: asString(lockedAttempt.customerFirstName),
        customerLastName: asString(lockedAttempt.customerLastName),
        customerPhone: asString(lockedAttempt.customerPhone) || undefined,
        shippingAddress: {
          address: asString(shippingAddress?.address) || 'Ritiro in negozio / N/A',
          postalCode: asString(shippingAddress?.postalCode) || '00000',
          city: asString(shippingAddress?.city) || 'Milano',
          province: asString(shippingAddress?.province) || 'MI',
          country: asString(shippingAddress?.country) || 'Italy',
        },
      },
    })

    for (const item of productItems) {
      await payload.create({
        collection: 'order-items',
        overrideAccess: true,
        locale,
        draft: false,
        data: {
          order: order.id,
          product: Number(item.productID),
          productTitle: item.productTitle,
          productSlug: item.productSlug || undefined,
          productBrand: item.productBrand || undefined,
          productCoverImage: item.productCoverImage || undefined,
          currency: 'EUR',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        },
      })
    }

    for (const item of serviceItems) {
      const createdServiceItem = await payload.create({
        collection: 'order-service-items',
        overrideAccess: true,
        locale,
        draft: false,
        data: {
          order: order.id,
          service: item.itemKind === 'program' ? undefined : Number(item.serviceID),
          program: item.itemKind === 'program' ? Number(item.programID) : undefined,
          itemKind: item.itemKind,
          variantKey: item.variantKey,
          variantLabel: item.variantLabel || undefined,
          serviceTitle: item.serviceTitle,
          serviceSlug: item.serviceSlug || undefined,
          durationMinutes: item.durationMinutes ?? undefined,
          sessions: item.sessions ?? undefined,
          programStepsSnapshot:
            item.itemKind === 'program' && Array.isArray(item.programStepsSnapshot)
              ? item.programStepsSnapshot.map((step) => ({
                  stepType: step.stepType,
                  title: step.title || undefined,
                  referenceTitle: step.referenceTitle || undefined,
                  referenceSlug: step.referenceSlug || undefined,
                }))
              : undefined,
          appointmentMode: lockedAttempt.appointmentMode || 'none',
          appointmentStatus:
            lockedAttempt.appointmentMode && lockedAttempt.appointmentMode !== 'none' ? 'pending' : 'none',
          appointmentRequestedDate: lockedAttempt.appointmentRequestedDate || undefined,
          appointmentRequestedTime: lockedAttempt.appointmentRequestedTime || undefined,
          currency: 'EUR',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        },
      })

      const sessionsTotal = Math.max(1, item.itemKind === 'package' ? (item.sessions ?? 1) : 1)
      const sessionPrice = item.lineTotal > 0 ? item.lineTotal / sessionsTotal : 0

      for (let sessionIndex = 1; sessionIndex <= sessionsTotal; sessionIndex += 1) {
        await payload.create({
          collection: 'order-service-sessions',
          overrideAccess: true,
          locale,
          draft: false,
          data: {
            order: order.id,
            orderServiceItem: createdServiceItem.id,
            service: item.itemKind === 'program' ? undefined : Number(item.serviceID),
            program: item.itemKind === 'program' ? Number(item.programID) : undefined,
            itemKind: item.itemKind,
            variantKey: item.variantKey,
            variantLabel: item.variantLabel || undefined,
            sessionIndex,
            sessionLabel:
              item.itemKind === 'package'
                ? `Seduta ${sessionIndex}`
                : item.itemKind === 'program'
                  ? 'Programma'
                  : 'Seduta unica',
            sessionsTotal,
            appointmentMode: lockedAttempt.appointmentMode || 'none',
            appointmentStatus:
              lockedAttempt.appointmentMode && lockedAttempt.appointmentMode !== 'none' ? 'pending' : 'none',
            appointmentRequestedDate: lockedAttempt.appointmentRequestedDate || undefined,
            appointmentRequestedTime: lockedAttempt.appointmentRequestedTime || undefined,
            serviceTitle: item.serviceTitle,
            serviceSlug: item.serviceSlug || undefined,
            durationMinutes: item.durationMinutes ?? undefined,
            currency: 'EUR',
            sessionPrice,
          },
        })
      }
    }

    await commitOrderInventory({
      payload,
      orderID: order.id,
      locale,
    })

    await payload.update({
      collection: 'checkout-attempts',
      id: lockedAttempt.id,
      overrideAccess: true,
      locale,
      data: {
        order: order.id,
        status: 'converted',
        convertedAt: new Date().toISOString(),
        inventoryReserved: false,
        inventoryReleased: false,
      },
    })

    const finalOrder = await payload.findByID({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      locale,
      depth: 0,
    })

    return { order: finalOrder, created: true }
  } finally {
    if (lockClient && attemptID) {
      try {
        await lockClient.query('select pg_advisory_unlock($1, $2)', [3150315, attemptID])
      } finally {
        await lockClient.end()
      }
    }
  }
}
