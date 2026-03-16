import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n/core'
import { getAvailableProductUnits } from '@/lib/server/shop/productWaitlists'

type WaitlistPayload = {
  productId?: string | number
  locale?: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const asNumericId = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value)
  return NaN
}

const getProductTitle = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const getBrandLabel = (value: unknown) => {
  if (!value || typeof value !== 'object') return ''
  const record = value as Record<string, unknown>
  if (typeof record.name === 'string') return record.name.trim()
  return ''
}

const buildWaitlistItem = (product: Record<string, unknown>) => ({
  id: String(product.id),
  title: getProductTitle(product.title) || getProductTitle(product.slug) || `Prodotto ${String(product.id)}`,
  slug: asString(product.slug) || undefined,
  currency: 'EUR',
  brand: getBrandLabel(product.brand) || undefined,
  format: asString(product.format) || undefined,
  coverImage:
    product.coverImage && typeof product.coverImage === 'object' && 'url' in product.coverImage
      ? asString((product.coverImage as { url?: unknown }).url) || null
      : null,
})

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WaitlistPayload
    const localeInput = asString(body.locale)
    const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
    const productId = asNumericId(body.productId)
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Missing productId.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const authResult = await payload.auth({ headers: request.headers })
    const user = authResult?.user
    if (!user || typeof user !== 'object' || typeof user.id !== 'number') {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      overrideAccess: false,
      locale,
      depth: 1,
      select: {
        id: true,
        title: true,
        slug: true,
        brand: true,
        format: true,
        coverImage: true,
        stock: true,
        allocatedStock: true,
        active: true,
      },
    })

    if (!product || product.active === false) {
      return NextResponse.json({ error: 'Product unavailable.' }, { status: 404 })
    }

    const available = getAvailableProductUnits(product)
    if (available > 0) {
      return NextResponse.json({ error: 'Product available.', available }, { status: 409 })
    }

    const existing = await payload.find({
      collection: 'product-waitlists',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      sort: '-updatedAt',
      where: {
        and: [
          { customer: { equals: user.id } },
          { product: { equals: productId } },
        ],
      },
    })

    const data = {
      customer: user.id,
      product: productId,
      locale,
      status: 'active' as const,
      customerEmail: asString(user.email),
      customerFirstName: asString((user as { firstName?: unknown }).firstName),
      customerLastName: asString((user as { lastName?: unknown }).lastName),
      productTitle: getProductTitle(product.title) || getProductTitle(product.slug) || `Prodotto ${productId}`,
      productSlug: asString(product.slug),
      productBrand: getBrandLabel(product.brand),
      notifiedAt: null,
      lastAvailabilityAt: null,
      notificationError: '',
    }

    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: 'product-waitlists',
        id: existing.docs[0].id,
        overrideAccess: true,
        locale,
        data,
      })
      return NextResponse.json({
        ok: true,
        status: updated.status,
        item: buildWaitlistItem(product as unknown as Record<string, unknown>),
      })
    }

    await payload.create({
      collection: 'product-waitlists',
      overrideAccess: true,
      locale,
      data,
    })

    return NextResponse.json({
      ok: true,
      status: 'active',
      item: buildWaitlistItem(product as unknown as Record<string, unknown>),
    })
  } catch (error) {
    console.error('Waitlist register error', error)
    return NextResponse.json({ error: 'Unable to register waitlist.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as WaitlistPayload
    const localeInput = asString(body.locale)
    const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
    const productId = asNumericId(body.productId)
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Missing productId.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const authResult = await payload.auth({ headers: request.headers })
    const user = authResult?.user
    if (!user || typeof user !== 'object' || typeof user.id !== 'number') {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const existing = await payload.find({
      collection: 'product-waitlists',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      sort: '-updatedAt',
      where: {
        and: [
          { customer: { equals: user.id } },
          { product: { equals: productId } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
    })

    const entry = existing.docs[0]
    if (!entry) {
      return NextResponse.json({ ok: true })
    }

    await payload.update({
      collection: 'product-waitlists',
      id: entry.id,
      overrideAccess: true,
      locale,
      data: {
        status: 'cancelled',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Waitlist cancel error', error)
    return NextResponse.json({ error: 'Unable to cancel waitlist.' }, { status: 500 })
  }
}
