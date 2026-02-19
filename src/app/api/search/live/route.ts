import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'

type SearchOption = {
  id: string
  kind:
    | 'service-detail'
    | 'service-list'
    | 'product-detail'
    | 'product-list'
    | 'brand-list'
    | 'line-list'
  label: string
  subtitle?: string
  href: string
  tags: string[]
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const asNumber = (value: unknown) => {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : NaN
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

const uniqueBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>()
  const output: T[] = []
  for (const item of items) {
    const key = getKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    output.push(item)
  }
  return output
}

const copyByLocale: Record<
  Locale,
  {
    services: string
    products: string
    brand: string
    line: string
    single: string
    package: string
    allServices: (query: string, count: number) => string
    allProducts: (query: string, count: number) => string
    matchesCountTag: (count: number) => string
  }
> = {
  it: {
    services: 'Servizi',
    products: 'Prodotti',
    brand: 'Brand',
    line: 'Linea',
    single: 'Singolo',
    package: 'Pacchetto',
    allServices: (query, count) => `Tutti i servizi per "${query}" (${count})`,
    allProducts: (query, count) => `Tutti i prodotti per "${query}" (${count})`,
    matchesCountTag: (count) => `${count} risultati`,
  },
  en: {
    services: 'Services',
    products: 'Products',
    brand: 'Brand',
    line: 'Line',
    single: 'Single',
    package: 'Package',
    allServices: (query, count) => `All services for "${query}" (${count})`,
    allProducts: (query, count) => `All products for "${query}" (${count})`,
    matchesCountTag: (count) => `${count} results`,
  },
  ru: {
    services: 'Услуги',
    products: 'Товары',
    brand: 'Бренд',
    line: 'Линия',
    single: 'Разовая услуга',
    package: 'Пакет',
    allServices: (query, count) => `Все услуги по "${query}" (${count})`,
    allProducts: (query, count) => `Все товары по "${query}" (${count})`,
    matchesCountTag: (count) => `${count} результатов`,
  },
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const localeInput = asString(url.searchParams.get('locale'))
  const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
  const query = asString(url.searchParams.get('q'))
  const copy = copyByLocale[locale]

  if (query.length < 2) {
    return NextResponse.json({ ok: true, query, options: [] as SearchOption[], productCount: 0, serviceCount: 0 })
  }

  const payload = await getPayloadClient()

  const [brands, brandLines, productsByText, servicesByText] = await Promise.all([
    payload.find({
      collection: 'brands',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 4,
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [{ name: { contains: query } }, { slug: { contains: query.toLowerCase() } }],
          },
        ],
      },
      select: { id: true, name: true, slug: true },
    }),
    payload.find({
      collection: 'brand-lines',
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 4,
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [{ name: { contains: query } }, { slug: { contains: query.toLowerCase() } }],
          },
        ],
      },
      select: { id: true, name: true, slug: true, brand: true },
    }),
    payload.find({
      collection: 'products',
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 10,
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [{ title: { contains: query } }, { slug: { contains: query.toLowerCase() } }],
          },
        ],
      },
      sort: '-updatedAt',
      select: { id: true, title: true, slug: true, brand: true, brandLine: true },
    }),
    payload.find({
      collection: 'services',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 12,
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [
              { name: { contains: query } },
              { slug: { contains: query.toLowerCase() } },
              { description: { contains: query } },
            ],
          },
        ],
      },
      sort: 'name',
      select: { id: true, name: true, slug: true, serviceType: true },
    }),
  ])

  const brandIds = brands.docs
    .map((doc) => asNumber(doc.id))
    .filter((id) => Number.isFinite(id))
  const brandLineIds = brandLines.docs
    .map((doc) => asNumber(doc.id))
    .filter((id) => Number.isFinite(id))

  const [productsByBrand, productsByLine] = await Promise.all([
    brandIds.length > 0
      ? payload.find({
          collection: 'products',
          locale,
          overrideAccess: false,
          depth: 1,
          limit: 12,
          where: {
            and: [{ active: { equals: true } }, { brand: { in: brandIds } }],
          },
          sort: '-updatedAt',
          select: { id: true, title: true, slug: true, brand: true, brandLine: true },
        })
      : Promise.resolve({ docs: [] as Array<Record<string, unknown>> }),
    brandLineIds.length > 0
      ? payload.find({
          collection: 'products',
          locale,
          overrideAccess: false,
          depth: 1,
          limit: 12,
          where: {
            and: [{ active: { equals: true } }, { brandLine: { in: brandLineIds } }],
          },
          sort: '-updatedAt',
          select: { id: true, title: true, slug: true, brand: true, brandLine: true },
        })
      : Promise.resolve({ docs: [] as Array<Record<string, unknown>> }),
  ])

  const allProductDocs = uniqueBy(
    [...productsByText.docs, ...productsByBrand.docs, ...productsByLine.docs],
    (doc) => String((doc as { id?: unknown }).id ?? ''),
  ).slice(0, 12)

  const productDetailOptions = allProductDocs
    .map((doc) => {
      const id = String((doc as { id?: unknown }).id ?? '')
      const title = asString((doc as { title?: unknown }).title)
      const slug = asString((doc as { slug?: unknown }).slug)
      if (!id || !title || !slug) return null

      const brandLineName =
        (doc as { brandLine?: unknown }).brandLine &&
        typeof (doc as { brandLine?: unknown }).brandLine === 'object'
          ? readLocalized(
              ((doc as { brandLine?: { name?: unknown } }).brandLine as { name?: unknown }).name,
              locale,
            )
          : ''

      return {
        id: `product-detail:${id}`,
        kind: 'product-detail' as const,
        label: title,
        subtitle: brandLineName || undefined,
        href: `/${locale}/shop/${slug}`,
        tags: [copy.products],
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const serviceDetailOptions = servicesByText.docs
    .map((doc) => {
      const id = String((doc as { id?: unknown }).id ?? '')
      const name = readLocalized((doc as { name?: unknown }).name, locale)
      const slug = asString((doc as { slug?: unknown }).slug)
      const serviceTypeRaw = asString((doc as { serviceType?: unknown }).serviceType)
      if (!id || !name || !slug) return null
      const typeTag =
        serviceTypeRaw === 'package' ? copy.package : serviceTypeRaw === 'single' ? copy.single : copy.services

      return {
        id: `service-detail:${id}`,
        kind: 'service-detail' as const,
        label: name,
        subtitle: copy.services,
        href: `/${locale}/services/service/${slug}`,
        tags: [copy.services, typeTag],
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const brandOptions = brands.docs
    .map((doc) => {
      const id = String(doc.id)
      const name = readLocalized(doc.name, locale)
      if (!id || !name) return null
      return {
        id: `brand-list:${id}`,
        kind: 'brand-list' as const,
        label: name,
        subtitle: copy.brand,
        href: `/${locale}/shop?section=shop-all&q=${encodeURIComponent(name)}`,
        tags: [copy.brand, copy.products],
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const lineOptions = brandLines.docs
    .map((doc) => {
      const id = String(doc.id)
      const name = readLocalized(doc.name, locale)
      const brandName =
        doc.brand && typeof doc.brand === 'object'
          ? readLocalized((doc.brand as { name?: unknown }).name, locale)
          : ''
      if (!id || !name) return null
      return {
        id: `line-list:${id}`,
        kind: 'line-list' as const,
        label: name,
        subtitle: brandName || copy.line,
        href: `/${locale}/shop?section=shop-all&q=${encodeURIComponent(name)}`,
        tags: [copy.line, copy.products],
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const serviceListOption: SearchOption | null =
    serviceDetailOptions.length > 0
      ? {
          id: `service-list:${query.toLowerCase()}`,
          kind: 'service-list',
          label: copy.allServices(query, serviceDetailOptions.length),
          href: `/${locale}/services?view=listino&q=${encodeURIComponent(query)}`,
          tags: [copy.services, copy.matchesCountTag(serviceDetailOptions.length)],
        }
      : null

  const productListOption: SearchOption | null =
    productDetailOptions.length > 0
      ? {
          id: `product-list:${query.toLowerCase()}`,
          kind: 'product-list',
          label: copy.allProducts(query, productDetailOptions.length),
          href: `/${locale}/shop?section=shop-all&q=${encodeURIComponent(query)}`,
          tags: [copy.products, copy.matchesCountTag(productDetailOptions.length)],
        }
      : null

  const options = [
    ...(serviceListOption ? [serviceListOption] : []),
    ...serviceDetailOptions,
    ...(productListOption ? [productListOption] : []),
    ...brandOptions,
    ...lineOptions,
    ...productDetailOptions,
  ].slice(0, 20)

  return NextResponse.json({
    ok: true,
    query,
    options,
    productCount: productDetailOptions.length,
    serviceCount: serviceDetailOptions.length,
  })
}
