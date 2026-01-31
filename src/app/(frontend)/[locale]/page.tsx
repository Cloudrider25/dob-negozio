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
  const resolveMediaValue = async (value: unknown, fallbackAlt = '') => {
    const direct = resolveMedia(value, fallbackAlt)
    if (direct) return direct
    if (typeof value === 'string' || typeof value === 'number') {
      const mediaDoc = await payload.findByID({
        collection: 'media',
        id: String(value),
        depth: 0,
        overrideAccess: false,
      })
      return resolveMedia(mediaDoc, fallbackAlt)
    }
    return null
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
  const storyHeroMedia = await resolveMediaValue(
    pageDoc?.storyHeroMedia,
    pageDoc?.storyHeroTitle || '',
  )

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

  const resolveProgramId = (value: unknown) => {
    if (!value) return null
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    if (typeof value === 'object' && 'id' in value) {
      const idValue = (value as { id?: string | number }).id
      return idValue ? String(idValue) : null
    }
    return null
  }

  const selectedProgramId = resolveProgramId(pageDoc?.homeProgram)
  let programDoc = selectedProgramId
    ? await payload.findByID({
        collection: 'programs',
        id: selectedProgramId,
        locale,
        depth: 0,
        overrideAccess: false,
      })
    : null

  if (!programDoc) {
    const programsResult = await payload.find({
      collection: 'programs',
      locale,
      overrideAccess: false,
      limit: 1,
      depth: 0,
      sort: '-createdAt',
    })
    programDoc = programsResult.docs[0] ?? null
  }

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

  const resolveGallerySecondary = (gallery: unknown, fallbackAlt: string) => {
    if (!Array.isArray(gallery)) return null
    const entries = gallery
      .map((item) =>
        item && typeof item === 'object'
          ? (item as { media?: unknown; isCover?: boolean })
          : null,
      )
      .filter(Boolean)
    const secondary =
      entries.find((entry) => !entry?.isCover && entry?.media) ?? entries[1] ?? entries[0]
    return secondary?.media ? resolveMedia(secondary.media, fallbackAlt) : null
  }

  const formatDuration = (minutes?: number | null) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) return undefined
    return `${minutes} min`
  }

  const formatProgramPrice = (value?: number | null, currency?: string | null) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return undefined
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  const resolveProductMedia = (product: unknown, fallbackAlt: string) => {
    if (!product || typeof product !== 'object') return null
    const record = product as { coverImage?: unknown; images?: unknown[]; title?: string | null }
    const gallery = Array.isArray(record.images) ? record.images : []
    return resolveMedia(record.coverImage || gallery[0], fallbackAlt)
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

  const programSteps =
    programDoc && Array.isArray(programDoc.steps)
      ? await Promise.all(
          programDoc.steps.map(async (step) => {
          const serviceId =
            step.stepType === 'service' ? resolveProgramId(step.stepService) : null
          const productId =
            step.stepType === 'product' ? resolveProgramId(step.stepProduct) : null
          const service =
            serviceId
              ? await payload.findByID({
                  collection: 'services',
                  id: serviceId,
                  locale,
                  depth: 1,
                  overrideAccess: false,
                })
              : null
          const product =
            productId
              ? await payload.findByID({
                  collection: 'products',
                  id: productId,
                  locale,
                  depth: 1,
                  overrideAccess: false,
                })
              : null

          const fallbackTitle = service?.name || product?.title || ''
          const fallbackSubtitle = service?.description || product?.description || ''
          const heroMedia =
            (await resolveMediaValue(step.stepHeroMedia, fallbackTitle)) ||
            (service
              ? resolveGalleryCover(service.gallery, fallbackTitle)
              : resolveProductMedia(product, fallbackTitle)) ||
            null
          const detailMedia =
            (await resolveMediaValue(step.stepDetailMedia, fallbackTitle)) ||
            (service
              ? resolveGallerySecondary(service.gallery, fallbackTitle)
              : resolveMedia((product && Array.isArray(product.images) ? product.images[1] : null), fallbackTitle)) ||
            heroMedia ||
            null

          return {
            id: step.id || `${fallbackTitle}-${Math.random()}`,
            title: step.stepTitle || fallbackTitle,
            subtitle: step.stepSubtitle || fallbackSubtitle,
            badge: step.stepBadge || null,
            heroMedia,
            detailMedia,
          }
        }),
        )
      : []

  const programData = programDoc
    ? {
        title: programDoc.title || undefined,
        description: programDoc.description || undefined,
        price: formatProgramPrice(programDoc.price, programDoc.currency) || undefined,
        slug: programDoc.slug || undefined,
        heroMedia: await resolveMediaValue(programDoc.heroMedia, programDoc.title || ''),
        steps: programSteps,
      }
    : null

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
      <StoryHero
        locale={locale}
        title={pageDoc?.storyHeroTitle || undefined}
        body={pageDoc?.storyHeroBody || undefined}
        ctaLabel={pageDoc?.storyHeroCtaLabel || undefined}
        ctaHref={pageDoc?.storyHeroCtaHref || undefined}
        media={storyHeroMedia || undefined}
      />
      <ProgramsSplitSection program={programData} locale={locale} />
      <ShopCarousel items={carouselItems} />
      <ValuesSection locale={locale} />
    </div>
  )
}
