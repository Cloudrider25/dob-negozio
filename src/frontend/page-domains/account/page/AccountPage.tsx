import { notFound, redirect } from 'next/navigation'

import { AccountDashboardClient } from '@/frontend/page-domains/account/dashboard/AccountDashboardClient'
import type { AccountSection } from '@/frontend/page-domains/account/types'
import { getAvailableProductUnits } from '@/lib/server/shop/productWaitlists'
import { getAuthenticatedUser } from '@/lib/server/auth/getAuthenticatedUser'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { isLocale } from '@/lib/i18n/core'
import type {
  Media,
  Order,
  OrderItem as PayloadOrderItem,
  OrderServiceSession,
  Product,
  ProductWaitlist,
} from '@/payload/generated/payload-types'

const ACCOUNT_SECTIONS: AccountSection[] = ['overview', 'services', 'orders', 'addresses', 'aesthetic']

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const resolveMediaUrl = (media: unknown) => {
  if (typeof media === 'string') return asString(media) || null
  if (!media || typeof media !== 'object') return null
  const record = media as Media
  return asString(record.thumbnailURL) || asString(record.url) || null
}

const resolveBrandName = (value: unknown) => {
  if (!value || typeof value !== 'object') return ''
  return asString((value as { name?: unknown }).name)
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ section?: string }>
}) {
  const { locale } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (!isLocale(locale)) {
    notFound()
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  const payload = await getPayloadClient()
  const initialSection: AccountSection = ACCOUNT_SECTIONS.includes(
    resolvedSearchParams?.section as AccountSection,
  )
    ? (resolvedSearchParams?.section as AccountSection)
    : 'overview'

  const ordersResult = await payload.find({
    collection: 'orders',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 20,
    sort: '-createdAt',
    where: {
      customer: {
        equals: user.id,
      },
    },
  })
  const orders = (ordersResult.docs as Order[]).filter((order) => {
    const isStripePendingAbandoned =
      order.paymentProvider === 'stripe' &&
      order.paymentStatus === 'pending' &&
      order.status === 'pending'
    return !isStripePendingAbandoned
  })
  const firstName = user.firstName?.trim() || ''
  const lastName = user.lastName?.trim() || ''
  const orderIds = orders.map((order) => order.id)
  const waitlistsResult = await payload.find({
    collection: 'product-waitlists',
    overrideAccess: false,
    user,
    depth: 2,
    limit: 100,
    sort: '-updatedAt',
    where: {
      and: [
        { customer: { equals: user.id } },
        { status: { not_equals: 'cancelled' } },
      ],
    },
  })

  const initialOrders: Array<{
    id: number
    orderNumber: string
    status: string
    paymentStatus: string
    total: number
    currency: string
    createdAt: string
    purchaseTitle: string
    purchaseThumb: string | null
    otherItemsCount: number
    quantity: number
    unitPrice: number
    productFulfillmentMode: 'shipping' | 'pickup' | 'none'
    trackingNumber: string | null
    trackingUrl: string | null
    deliveryStatus: string | null
    deliveryUpdatedAt: string | null
  }> = []
  const initialWaitlistRows: Array<{
    id: string
    productId: number
    title: string
    slug: string
    brand: string
    price: number
    currency: string
    format: string
    coverImage: string | null
    status: 'active' | 'notified' | 'cancelled'
    availableNow: boolean
    registeredAt: string | null
    notifiedAt: string | null
  }> = []

  for (const entry of waitlistsResult.docs as ProductWaitlist[]) {
    const product =
      entry.product && typeof entry.product === 'object' ? (entry.product as Product) : null
    if (!product) continue
    if (product.active === false) continue

    initialWaitlistRows.push({
      id: String(entry.id),
      productId: product.id,
      title: asString(product.title) || entry.productTitle,
      slug: asString(product.slug) || entry.productSlug,
      brand: resolveBrandName(product.brand) || entry.productBrand || '',
      price: typeof product.price === 'number' ? product.price : 0,
      currency: 'EUR',
      format: asString(product.format),
      coverImage: resolveMediaUrl(product.coverImage),
      status: entry.status,
      availableNow: getAvailableProductUnits(product) > 0,
      registeredAt: entry.createdAt ?? null,
      notifiedAt: entry.notifiedAt ?? null,
    })
  }

  initialWaitlistRows.sort((a, b) => {
    if (a.availableNow !== b.availableNow) return a.availableNow ? -1 : 1
    return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()
  })

  if (orderIds.length > 0) {
    // Intentional admin Local API read, constrained to already-authorized user's orders.
    const orderItemsResult = await payload.find({
      collection: 'order-items',
      depth: 0,
      limit: 500,
      sort: 'createdAt',
      where: {
        order: {
          in: orderIds,
        },
      },
    })

    const itemsByOrder = new Map<number, PayloadOrderItem[]>()
    for (const item of orderItemsResult.docs as PayloadOrderItem[]) {
      const orderId =
        typeof item.order === 'number'
          ? item.order
          : item.order && typeof item.order === 'object' && 'id' in item.order
            ? Number(item.order.id)
            : NaN
      if (!Number.isFinite(orderId)) continue
      const list = itemsByOrder.get(orderId) ?? []
      list.push(item)
      itemsByOrder.set(orderId, list)
    }

    const ordersById = new Map(orders.map((order) => [order.id, order] as const))

    for (const [orderId, items] of itemsByOrder.entries()) {
      const order = ordersById.get(orderId)
      if (!order) continue
      const sortedItems = [...items].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      for (const item of sortedItems) {
        initialOrders.push({
          id: Number(item.id),
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: item.lineTotal,
          currency: item.currency || order.currency,
          createdAt: order.createdAt,
          purchaseTitle: item.productTitle || order.orderNumber,
          purchaseThumb: item.productCoverImage || null,
          otherItemsCount: Math.max(0, sortedItems.length - 1),
          quantity: Math.max(1, item.quantity || 1),
          unitPrice: item.unitPrice || item.lineTotal || 0,
          productFulfillmentMode:
            (order.productFulfillmentMode as 'shipping' | 'pickup' | 'none' | null) ?? 'shipping',
          trackingNumber: order.sendcloud?.trackingNumber ?? null,
          trackingUrl: order.sendcloud?.trackingUrl ?? null,
          deliveryStatus: order.sendcloud?.statusMessage ?? null,
          deliveryUpdatedAt: order.sendcloud?.lastSyncAt ?? null,
        })
      }
    }
  }

  const serviceRows: Array<{
    id: string
    orderServiceItemId: string
    sessionIndex: number
    orderId: number
    orderNumber: string
    orderCreatedAt: string
    orderStatus: string
    paymentStatus: string
    itemKind: 'service' | 'package' | 'program'
    serviceTitle: string
    variantLabel: string
    sessionLabel: string
    sessionsTotal: number
    durationMinutes: number | null
    rowPrice: number
    currency: string
    appointmentMode: string
    appointmentStatus: string
    requestedDate: string | null
    requestedTime: string | null
    proposedDate: string | null
    proposedTime: string | null
    confirmedAt: string | null
  }> = []

  if (orderIds.length > 0) {
    // Intentional admin Local API read, constrained to already-authorized user's orders.
    const serviceSessionsResult = await payload.find({
      collection: 'order-service-sessions',
      depth: 1,
      limit: 500,
      sort: '-createdAt',
      where: {
        order: {
          in: orderIds,
        },
      },
    })

    for (const session of serviceSessionsResult.docs as OrderServiceSession[]) {
      const orderRelation = typeof session.order === 'object' && session.order ? session.order : null
      if (!orderRelation) continue
      serviceRows.push({
        id: String(session.id),
        orderServiceItemId:
          typeof session.orderServiceItem === 'number'
            ? String(session.orderServiceItem)
            : session.orderServiceItem && typeof session.orderServiceItem === 'object' && 'id' in session.orderServiceItem
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
          session.variantLabel?.trim() ||
          (session.itemKind === 'package'
            ? 'Pacchetto'
            : session.itemKind === 'program'
              ? 'Programma'
              : 'Default'),
        sessionLabel:
          session.sessionLabel?.trim() ||
          (session.itemKind === 'package'
            ? `Seduta ${session.sessionIndex ?? 1}`
            : session.itemKind === 'program'
              ? 'Programma completo'
              : 'Seduta unica'),
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
      })
    }
  }

  const addressMap = new Map<
    string,
    {
      id: string
      fullName: string
      address: string
      postalCode: string
      city: string
      province: string
      country: string
      firstName: string
      lastName: string
      company: string
      streetAddress: string
      apartment: string
      phone: string
      isDefault: boolean
    }
  >()

  if (Array.isArray(user.addresses) && user.addresses.length > 0) {
    for (const entry of user.addresses) {
      if (!entry) continue
      const fullName = [entry.firstName, entry.lastName].filter(Boolean).join(' ').trim()
      const addressLine = [entry.streetAddress, entry.apartment].filter(Boolean).join(', ').trim()
      if (!addressLine || !entry.city || !entry.province || !entry.postalCode || !entry.country) continue
      const key = `${addressLine}|${entry.postalCode}|${entry.city}|${entry.province}|${entry.country}`
      if (addressMap.has(key)) continue
      if (entry.isDefault) {
        addressMap.clear()
      }
      addressMap.set(key, {
        id: key,
        fullName,
        address: addressLine,
        postalCode: entry.postalCode,
        city: entry.city,
        province: entry.province,
        country: entry.country,
        firstName: entry.firstName || '',
        lastName: entry.lastName || '',
        company: entry.company || '',
        streetAddress: entry.streetAddress || '',
        apartment: entry.apartment || '',
        phone: entry.phone || '',
        isDefault: Boolean(entry.isDefault),
      })
      if (entry.isDefault) {
        // Keep default first and then append remaining non-default later.
        continue
      }
    }
  }

  const isPlaceholderAddress = (shipping: NonNullable<Order['shippingAddress']>) => {
    const combined = [
      shipping.address,
      shipping.postalCode,
      shipping.city,
      shipping.province,
      shipping.country,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    if (!combined.trim()) return true

    return (
      combined.includes('da confermare') ||
      combined.includes('wallet') ||
      combined.includes('00000')
    )
  }

  if (addressMap.size === 0) for (const order of orders) {
    const shipping = order.shippingAddress
    if (!shipping) continue
    if (isPlaceholderAddress(shipping)) continue
    const key = `${shipping.address}|${shipping.postalCode}|${shipping.city}|${shipping.province}|${shipping.country}`
    if (addressMap.has(key)) continue
    addressMap.set(key, {
      id: key,
      fullName: `${order.customerFirstName} ${order.customerLastName}`.trim(),
      address: shipping.address,
      postalCode: shipping.postalCode,
      city: shipping.city,
      province: shipping.province,
      country: shipping.country,
      firstName: order.customerFirstName || '',
      lastName: order.customerLastName || '',
      company: '',
      streetAddress: shipping.address.split(',')[0]?.trim() || shipping.address,
      apartment: shipping.address.includes(',') ? shipping.address.split(',').slice(1).join(',').trim() : '',
      phone: '',
      isDefault: addressMap.size === 0,
    })
  }
  const initialAddresses = Array.from(addressMap.values())

  return (
    <main className="mx-auto w-full ">
      <AccountDashboardClient
        locale={locale}
        userId={user.id}
        email={user.email}
        firstName={firstName}
        lastName={lastName}
        phone={user.phone?.trim() || ''}
        initialOrders={initialOrders}
        initialWaitlistRows={initialWaitlistRows}
        initialServiceRows={serviceRows}
        initialAddresses={initialAddresses}
        initialSection={initialSection}
      />
    </main>
  )
}
