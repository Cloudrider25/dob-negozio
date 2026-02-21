import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { Hero } from '@/components/heroes/Hero'
import { UICCarousel } from '@/components/carousel/UIC_Carousel'
import { StoryHero } from '@/components/heroes/StoryHero'
import { ValuesSection, type ValuesSectionItem } from '@/components/sections/ValuesSection'
import { ProgramsSplitSection } from '@/components/sections/ProgramsSplitSection'
import { ProtocolSplit, type ProtocolSplitStep } from '@/components/sections/ProtocolSplit'
import { getPayloadClient } from '@/lib/getPayloadClient'
import type { ServicesCarouselItem } from '@/components/carousel/types'
import styles from './home.module.css'

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
    fallbackLocale: 'it',
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
    pageDoc?.storyHeroHomeMedia,
    pageDoc?.storyHeroHomeTitle || '',
  )
  const valuesMedia = await resolveMediaValue(pageDoc?.valuesSection?.media, t.story.title)
  const valuesItemsRaw = Array.isArray(pageDoc?.valuesSection?.items)
    ? pageDoc?.valuesSection?.items
    : []
  const valuesItems = valuesItemsRaw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const record = item as {
        label?: string | null
        title?: string | null
        ctaLabel?: string | null
        ctaHref?: string | null
      }
      const label = record.label || record.title || `value-${index + 1}`
      return {
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        title: record.title || '',
        ctaLabel: record.ctaLabel || undefined,
        ctaHref: record.ctaHref || undefined,
      } satisfies ValuesSectionItem
    })
    .filter(Boolean) as ValuesSectionItem[]

  const protocolStepsRaw = Array.isArray(pageDoc?.protocolSplit?.steps)
    ? pageDoc?.protocolSplit?.steps
    : []
  const protocolSteps = (
    await Promise.all(
      protocolStepsRaw.map(async (step, index) => {
        if (!step || typeof step !== 'object') return null
        const record = step as {
          label?: string | null
          title?: string | null
          subtitle?: string | null
          media?: unknown
        }
        const media = await resolveMediaValue(record.media, record.title || record.label || '')
        if (!record.title) return null
        return {
          id: String(index + 1).padStart(2, '0'),
          label: record.label || `0${index + 1}`,
          title: record.title,
          subtitle: record.subtitle || '',
          image: media?.url || '/api/media/file/hero_homepage_light-1.png',
          imageAlt: media?.alt || record.title,
        } satisfies ProtocolSplitStep
      }),
    )
  ).filter(Boolean) as ProtocolSplitStep[]

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
    url: '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg',
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

  const carouselItems: ServicesCarouselItem[] = productsResult.docs
    .map((product) => {
      const gallery = Array.isArray(product.images) ? product.images : []
      const media = resolveMedia(product.coverImage || gallery[0], product.title || '') || fallbackImage
      return {
        title: product.title || '',
        subtitle: product.description || undefined,
        price: formatPrice(product.price),
        duration: null,
        image: { url: media.url, alt: media.alt },
        tag: null,
        badgeLeft: null,
        badgeRight: null,
        href: product.slug ? `/${locale}/shop/${product.slug}` : undefined,
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
    <div className={styles.page}>
      {hasHero && (
        <Hero
          eyebrow={t.hero.eyebrow}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={darkHeroMedia || undefined}
          mediaLight={lightHeroMedia || undefined}
          ctas={[
            { href: `/${locale}/services`, label: t.nav.services, kind: 'hero' },
            { href: `/${locale}/shop`, label: t.nav.shop, kind: 'hero' },
          ]}
        />
      )}
      <UICCarousel
        items={serviceItems}
        ariaLabel="Services carousel"
        emptyLabel="Nessun servizio disponibile."
      />
      <ProtocolSplit
        locale={locale}
        eyebrow={pageDoc?.protocolSplit?.eyebrow || t.nav.protocol}
        steps={protocolSteps.length > 0 ? protocolSteps : undefined}
      />
      <StoryHero
        locale={locale}
        title={pageDoc?.storyHeroHomeTitle || undefined}
        body={pageDoc?.storyHeroHomeBody || undefined}
        ctaLabel={pageDoc?.storyHeroHomeCtaLabel || undefined}
        ctaHref={pageDoc?.storyHeroHomeCtaHref || undefined}
        media={storyHeroMedia || undefined}
      />
      <ProgramsSplitSection program={programData} locale={locale} />
      <UICCarousel
        items={carouselItems}
        ariaLabel="Shop carousel"
        emptyLabel="Nessun prodotto disponibile."
      />
      <ValuesSection
        items={valuesItems.length > 0 ? valuesItems : undefined}
        media={valuesMedia ? { url: valuesMedia.url, alt: valuesMedia.alt } : undefined}
      />
    </div>
  )
}
