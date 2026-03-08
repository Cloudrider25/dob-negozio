import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/core'
import { Hero } from '@/frontend/components/heroes/Hero'
import { Carousel } from '@/frontend/components/carousel/ui/Carousel'
import { createCarouselItem } from '@/frontend/components/carousel/shared/mappers'
import { ValuesSection, type ValuesSectionItem } from '@/frontend/page-domains/home/sections/ValuesSection'
import { ProgramsSplitSection } from '@/frontend/page-domains/home/sections/ProgramsSplitSection'
import { ProtocolSplit, type ProtocolSplitStep } from '@/frontend/components/sections/ProtocolSplit'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import styles from '@/frontend/page-domains/home/page/HomePage.module.css'
import type { HomeRouteParams } from '@/frontend/page-domains/home/internal/contracts'
import {
  formatDuration,
  formatPrice,
  formatProgramPrice,
  formatServiceTag,
  resolveMediaValue,
  resolveProgramId,
} from '@/frontend/page-domains/home/internal/shared'
import {
  resolveGalleryCover,
  resolveGallerySecondary,
  resolveMedia,
} from '@/lib/frontend/media/resolve'

export default async function HomePage({
  params,
}: {
  params: HomeRouteParams
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
    payload,
    pageDoc?.storyHeroMedia,
    pageDoc?.storyHeroTitle || '',
  )
  const storyHeroTitle = pageDoc?.storyHeroTitle || 'il necessario, fatto davvero bene'
  const storyHeroBody =
    pageDoc?.storyHeroBody ||
    'In DOB Milano crediamo in pochi essenziali, curati in ogni dettaglio. Formule mirate, performance reale e un gesto quotidiano che diventa rituale: pulizia, trattamento, luce.'
  const storyHeroCtaLabel = pageDoc?.storyHeroCtaLabel || 'Scopri DOB'
  const storyHeroCtaHref = pageDoc?.storyHeroCtaHref || `/${locale}/shop`
  const storyHeroImage = {
    url: storyHeroMedia?.url || '/api/media/file/hero_homepage_light-1.png',
    alt: storyHeroMedia?.alt?.trim() || storyHeroTitle,
    mimeType: storyHeroMedia?.mimeType || null,
  }
  const valuesMedia = await resolveMediaValue(payload, pageDoc?.valuesSection?.media, t.story.title)
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
        const media = await resolveMediaValue(
          payload,
          record.media,
          record.title || record.label || '',
        )
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

  const fallbackImage = {
    url: '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg',
    alt: t.shop.title,
  }

  const resolveProductMedia = (product: unknown, fallbackAlt: string) => {
    if (!product || typeof product !== 'object') return null
    const record = product as { coverImage?: unknown; images?: unknown[]; title?: string | null }
    const gallery = Array.isArray(record.images) ? record.images : []
    return resolveMedia(record.coverImage || gallery[0], fallbackAlt)
  }

  const serviceItems: CarouselItem[] = servicesResult.docs
    .map((service) => {
      const media = resolveGalleryCover(service.gallery, service.name || '') || fallbackImage
      const formattedPrice = formatPrice(locale, service.price, 'EUR') || null
      return createCarouselItem({
        id: service.id,
        slug: service.slug || undefined,
        title: service.name,
        subtitle: service.description || undefined,
        price: formattedPrice,
        duration: formatDuration(service.durationMinutes) || null,
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
        mobileCtaLabel: formattedPrice ? `prenota - ${formattedPrice}` : 'prenota',
      })
    })
    .filter((item): item is CarouselItem => Boolean(item))

  const carouselItems: CarouselItem[] = productsResult.docs
    .map((product) => {
      const gallery = Array.isArray(product.images) ? product.images : []
      const media = resolveMedia(product.coverImage || gallery[0], product.title || '') || fallbackImage
      const formattedPrice = formatPrice(locale, product.price) || null
      return createCarouselItem({
        id: product.id,
        slug: product.slug || undefined,
        title: product.title,
        subtitle: product.description || undefined,
        price: formattedPrice,
        duration: null,
        image: { url: media.url, alt: media.alt },
        tag: null,
        badgeLeft: null,
        badgeRight: null,
        href: product.slug ? `/${locale}/shop/${product.slug}` : undefined,
        mobileCtaLabel: formattedPrice ? `compra - ${formattedPrice}` : 'compra',
      })
    })
    .filter((item): item is CarouselItem => Boolean(item))

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
            (await resolveMediaValue(payload, step.stepHeroMedia, fallbackTitle)) ||
            (service
              ? resolveGalleryCover(service.gallery, fallbackTitle)
              : resolveProductMedia(product, fallbackTitle)) ||
            null
          const detailMedia =
            (await resolveMediaValue(payload, step.stepDetailMedia, fallbackTitle)) ||
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
        price: formatProgramPrice(locale, programDoc.price, programDoc.currency) || undefined,
        slug: programDoc.slug || undefined,
        heroMedia: await resolveMediaValue(payload, programDoc.heroMedia, programDoc.title || ''),
        steps: programSteps,
      }
    : null

  return (
    <div className={`frontend-page ${styles.page}`}>
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
      <Carousel
        items={serviceItems}
        ariaLabel="Services carousel"
        emptyLabel="Nessun servizio disponibile."
      />
      <ProtocolSplit
        locale={locale}
        eyebrow={pageDoc?.protocolSplit?.eyebrow || t.nav.protocol}
        steps={protocolSteps.length > 0 ? protocolSteps : undefined}
      />
      <Hero
        ariaLabel="Story highlight"
        title={storyHeroTitle}
        titleAs="h2"
        description={storyHeroBody}
        variant="style3"
        mediaLight={storyHeroImage}
        eagerMedia="light"
        showOverlay={false}
        ctas={[
          {
            href: storyHeroCtaHref,
            label: storyHeroCtaLabel,
            kind: 'main',
          },
        ]}
      />
      <ProgramsSplitSection program={programData} locale={locale} />
      <Carousel
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
