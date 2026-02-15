import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'
import { normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import type { Product } from '@/payload-types'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const asNumber = (value: unknown) => {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : NaN
}

const relationId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' && Number.isFinite(id)) return id
  }
  return null
}

const readLocalized = (value: unknown, locale: Locale) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((entry) => typeof entry === 'string')
    if (typeof first === 'string') return first
  }
  return ''
}

const mediaUrl = (value: unknown) => {
  return normalizeThumbnailSrc(value) || ''
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const productId = asNumber(url.searchParams.get('productId'))
  const localeInput = asString(url.searchParams.get('locale'))
  const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
  const excludeInput = asString(url.searchParams.get('exclude'))
  const limit = Math.min(6, Math.max(1, asNumber(url.searchParams.get('limit')) || 2))

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ ok: false, error: 'Missing productId.' }, { status: 400 })
  }

  const excludeIds = excludeInput
    .split(',')
    .map((entry) => asNumber(entry))
    .filter((entry) => Number.isFinite(entry))
  excludeIds.push(productId)
  const uniqueExclude = Array.from(new Set(excludeIds))

  const payload = await getPayloadClient()

  const seed = (await payload.findByID({
    collection: 'products',
    id: productId,
    locale,
    depth: 1,
    overrideAccess: false,
    select: {
      id: true,
      brand: true,
      brandLine: true,
    },
  })) as Product

  const seedBrandLineId = relationId(seed.brandLine)
  const seedBrandId = relationId(seed.brand)

  const andConditions: Array<Record<string, unknown>> = [
    { active: { equals: true } },
    { id: { not_in: uniqueExclude } },
  ]
  if (seedBrandLineId) {
    andConditions.push({ brandLine: { equals: seedBrandLineId } })
  } else if (seedBrandId) {
    andConditions.push({ brand: { equals: seedBrandId } })
  }

  const where = { and: andConditions }

  const products = await payload.find({
    collection: 'products',
    locale,
    depth: 1,
    overrideAccess: false,
    limit,
    where: where as never,
    sort: '-updatedAt',
    select: {
      id: true,
      title: true,
      price: true,
      format: true,
      coverImage: true,
      brand: true,
      brandLine: true,
    },
  })

  const docs = products.docs.map((doc) => {
    const lineName =
      doc.brandLine && typeof doc.brandLine === 'object'
        ? readLocalized(doc.brandLine.name, locale)
        : ''
    const brandName =
      doc.brand && typeof doc.brand === 'object' ? readLocalized(doc.brand.name, locale) : ''

    return {
      id: String(doc.id),
      title: doc.title || '',
      price: typeof doc.price === 'number' ? doc.price : null,
      currency: 'EUR',
      format: asString(doc.format),
      coverImage: mediaUrl(doc.coverImage),
      lineName,
      brandName,
    }
  })

  return NextResponse.json({
    ok: true,
    docs,
  })
}
