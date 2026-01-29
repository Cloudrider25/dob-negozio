import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { Hero } from '@/components/Hero'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { ServicesCarousel, type ServicesCarouselItem } from '@/components/ServicesCarousel'
import { ShopCarousel, type ShopCarouselItem } from '@/components/ShopCarousel'
import { StoryHero } from '@/components/StoryHero'
import { ValuesSection } from '@/components/ValuesSection'
import { ProgramsSplitSection } from '@/components/ProgramsSplitSection'
import styles from './home.module.css'
import { getPayloadClient } from '@/lib/getPayloadClient'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const pageConfig = await payload.find({
    collection: 'pages',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      pageKey: {
        equals: 'home',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown, fallbackAlt = '') => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt, mimeType: typed.mimeType || null }
  }
  const darkHeroMedia = resolveMedia(heroMedia?.[0], t.hero.title)
  const lightHeroMedia = resolveMedia(heroMedia?.[1], t.hero.title)
  const hasHero = Boolean(darkHeroMedia || lightHeroMedia)
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle
      ? pageDoc.heroTitle
      : t.hero.title
  const heroDescription = pageDoc?.heroDescription ?? t.hero.subtitle

  const servicesResult = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    limit: 6,
    depth: 1,
    where: {
      active: { equals: true },
    },
    sort: '-createdAt',
  })

  const productsResult = await payload.find({
    collection: 'products',
    locale,
    overrideAccess: false,
    limit: 6,
    depth: 1,
    where: {
      active: { equals: true },
    },
    sort: '-createdAt',
  })

  const formatPrice = (value?: number | null, currency?: string | null) => {
    if (typeof value !== 'number') return ''
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  const fallbackImage = {
    url: '/media/493b3205c13b5f67b36cf794c2222583.jpg',
    alt: t.shop.title,
  }

  const formatServiceTag = (value?: string | null) => {
    if (value === 'package') return 'Pacchetto'
    if (value === 'single') return 'Singolo'
    return null
  }

  const resolveGalleryCover = (gallery: unknown, fallbackAlt: string) => {
    if (!Array.isArray(gallery)) return null
    const entries = gallery
      .map((item) =>
        item && typeof item === 'object'
          ? (item as { media?: unknown; isCover?: boolean })
          : null,
      )
      .filter(Boolean)
    const cover = entries.find((entry) => entry?.isCover) ?? entries[0]
    return cover?.media ? resolveMedia(cover.media, fallbackAlt) : null
  }

  const formatDuration = (minutes?: number | null) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) return undefined
    return `${minutes} min`
  }

  const serviceItems: ServicesCarouselItem[] = servicesResult.docs
    .map((service) => {
      const media = resolveGalleryCover(service.gallery, service.name || '') || fallbackImage
      return {
        title: service.name || '',
        subtitle: service.description || undefined,
        price: formatPrice(service.price, 'EUR'),
        duration: formatDuration(service.durationMinutes),
        image: { url: media.url, alt: media.alt },
        tag: formatServiceTag(service.serviceType),
        badgeLeft:
          service.intent && typeof service.intent === 'object' && 'label' in service.intent
            ? String((service.intent as { label?: string }).label || '')
            : null,
        badgeRight:
          service.badge && typeof service.badge === 'object' && 'name' in service.badge
            ? String((service.badge as { name?: string }).name || '')
            : null,
        href: service.slug ? `/${locale}/services/service/${service.slug}` : undefined,
      }
    })
    .filter((item) => Boolean(item && item.title))

  const carouselItems: ShopCarouselItem[] = productsResult.docs
    .map((product) => {
      const gallery = Array.isArray(product.images) ? product.images : []
      const media = resolveMedia(product.coverImage || gallery[0], product.title || '') || fallbackImage
      return {
        title: product.title || '',
        subtitle: product.description || undefined,
        price: formatPrice(product.price, product.currency),
        image: { url: media.url, alt: media.alt },
      }
    })
    .filter((item) => Boolean(item && item.title))

  return (
    <div className="home-page flex flex-col gap-10">
      {hasHero && (
        <Hero
          eyebrow={t.hero.eyebrow}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={darkHeroMedia || undefined}
          mediaLight={lightHeroMedia || undefined}
          ctas={[
            { href: `/${locale}/services`, label: t.nav.services, variant: 'primary' },
            { href: `/${locale}/shop`, label: t.nav.shop, variant: 'outline' },
          ]}
        />
      )}
      <ServicesCarousel items={serviceItems} />
      <StoryHero locale={locale} />
      <ProgramsSplitSection />
      <ShopCarousel items={carouselItems} />
      <ValuesSection locale={locale} />
    </div>
  )
}
