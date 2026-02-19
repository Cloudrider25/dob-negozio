import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'
import { normalizeThumbnailSrc } from '@/lib/media/thumbnail'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

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

const topSearchesByLocale: Record<Locale, string[]> = {
  it: ['Detergente viso', 'Siero vitamina C', 'Trattamento anti-age', 'Cellulite', 'Lifting viso'],
  en: ['Face cleanser', 'Vitamin C serum', 'Anti-age treatment', 'Cellulite', 'Face lifting'],
  ru: ['Очищение лица', 'Сыворотка с витамином C', 'Антивозрастной уход', 'Целлюлит', 'Лифтинг лица'],
}

const recommendationLabelByLocale: Record<Locale, string> = {
  it: 'Tra i più richiesti',
  en: 'Among best sellers',
  ru: 'Среди бестселлеров',
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const localeInput = asString(url.searchParams.get('locale'))
  const locale: Locale = isLocale(localeInput) ? localeInput : 'it'

  const payload = await getPayloadClient()

  const featuredProducts = await payload.find({
    collection: 'products',
    locale,
    depth: 1,
    overrideAccess: false,
    limit: 1,
    where: {
      and: [{ active: { equals: true } }, { featured: { equals: true } }],
    },
    sort: '-updatedAt',
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      coverImage: true,
      images: true,
    },
  })

  const product = featuredProducts.docs[0]
  if (product) {
    const firstGallery = Array.isArray(product.images) ? product.images[0] : null
    return NextResponse.json({
      ok: true,
      suggestions: topSearchesByLocale[locale],
      recommendation: {
        type: 'product',
        title: asString(product.title),
        subtitle: recommendationLabelByLocale[locale],
        href: `/${locale}/shop/${asString(product.slug)}`,
        image: normalizeThumbnailSrc(product.coverImage) || normalizeThumbnailSrc(firstGallery),
        cta: locale === 'it' ? 'Apri prodotto' : locale === 'ru' ? 'Открыть товар' : 'Open product',
      },
    })
  }

  const services = await payload.find({
    collection: 'services',
    locale,
    depth: 1,
    overrideAccess: false,
    limit: 1,
    where: {
      active: { equals: true },
    },
    sort: '-updatedAt',
    select: {
      id: true,
      name: true,
      slug: true,
      gallery: true,
    },
  })

  const service = services.docs[0]
  const firstGalleryItem = Array.isArray(service?.gallery) ? service.gallery[0] : null
  const serviceMedia = firstGalleryItem && typeof firstGalleryItem === 'object' ? (firstGalleryItem as { media?: unknown }).media : null

  return NextResponse.json({
    ok: true,
    suggestions: topSearchesByLocale[locale],
    recommendation: service
      ? {
          type: 'service',
          title: readLocalized(service.name, locale),
          subtitle: recommendationLabelByLocale[locale],
          href: `/${locale}/services/service/${asString(service.slug)}`,
          image: normalizeThumbnailSrc(serviceMedia),
          cta: locale === 'it' ? 'Apri servizio' : locale === 'ru' ? 'Открыть услугу' : 'Open service',
        }
      : null,
  })
}
