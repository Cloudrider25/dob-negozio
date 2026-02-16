import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { Hero } from '@/components/heroes/Hero'
import { StoryHeroNote } from '@/components/heroes/StoryHeroNote'
import { StoryValuesSection, type StoryValuesItem } from '@/components/sections/StoryValuesSection'
import { StoryTeamSection, type StoryTeamItem } from '@/components/sections/StoryTeamSection'
import { UICCarousel } from '@/components/carousel/UIC_Carousel'
import type { ServicesCarouselItem } from '@/components/carousel/types'
import type { Where } from 'payload'
import styles from './our-story.module.css'

export default async function OurStoryPage({
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
        equals: 'our-story',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown, fallbackAlt = '') => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt || t.story.title, mimeType: typed.mimeType || null }
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
      return resolveMedia(mediaDoc ?? null, fallbackAlt)
    }
    return null
  }
  const heroDark = resolveMedia(heroMedia?.[0], t.story.title)
  const heroLight = resolveMedia(heroMedia?.[1], t.story.title)
  const hasHero = Boolean(heroDark || heroLight)
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle
      ? pageDoc.heroTitle
      : t.story.title
  const heroDescription = pageDoc?.heroDescription ?? t.story.lead
  const storyNoteMedia = await resolveMediaValue(
    pageDoc?.storyNoteMedia,
    pageDoc?.storyNoteLabel || t.story.title,
  )
  const storyValuesItemsRaw = Array.isArray(pageDoc?.storyValues?.items)
    ? pageDoc?.storyValues?.items
    : []
  const storyValuesItems = (
    await Promise.all(
      storyValuesItemsRaw.map(async (item) => {
        if (!item || typeof item !== 'object') return null
        const record = item as {
          label?: string | null
          title?: string | null
          description?: string | null
          media?: unknown
        }
        const media = await resolveMediaValue(
          record.media,
          record.title || record.label || t.story.title,
        )
        return {
          label: record.label || null,
          title: record.title || null,
          description: record.description || null,
          media: media ? { url: media.url, alt: media.alt } : null,
        } satisfies StoryValuesItem
      }),
    )
  ).filter(Boolean) as StoryValuesItem[]

  const storyTeamItemsRaw = Array.isArray(pageDoc?.storyTeam?.items)
    ? pageDoc?.storyTeam?.items
    : []
  const storyTeamItems = (
    await Promise.all(
      storyTeamItemsRaw.map(async (item) => {
        if (!item || typeof item !== 'object') return null
        const record = item as {
          name?: string | null
          role?: string | null
          bio?: string | null
          image?: unknown
        }
        const image = await resolveMediaValue(
          record.image,
          record.name || record.role || t.story.title,
        )
        return {
          name: record.name || null,
          role: record.role || null,
          bio: record.bio || null,
          image: image ? { url: image.url, alt: image.alt } : null,
        } satisfies StoryTeamItem
      }),
    )
  ).filter(Boolean) as StoryTeamItem[]

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

  const formatDuration = (minutes?: number | null) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) return undefined
    return `${minutes} min`
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

  const normalizeIds = (values?: unknown[] | null) =>
    Array.isArray(values)
      ? values
          .map((value) => {
            if (typeof value === 'string' || typeof value === 'number') return String(value)
            if (value && typeof value === 'object' && 'id' in value) {
              const idValue = (value as { id?: string | number }).id
              return idValue ? String(idValue) : null
            }
            return null
          })
          .filter(Boolean)
      : []

  const servicesSettings = pageDoc?.servicesCarousel ?? {}
  const servicesLimit =
    typeof servicesSettings?.limit === 'number' && servicesSettings.limit > 0
      ? servicesSettings.limit
      : 6

  const servicesWhere: Where = {
    and: [
      { active: { equals: true } },
      ...(Array.isArray(servicesSettings?.serviceTypes) && servicesSettings.serviceTypes.length
        ? [{ serviceType: { in: servicesSettings.serviceTypes } }]
        : []),
      ...(Array.isArray(servicesSettings?.gender) && servicesSettings.gender.length
        ? [{ gender: { in: servicesSettings.gender } }]
        : []),
      ...(Array.isArray(servicesSettings?.modality) && servicesSettings.modality.length
        ? [{ modality: { in: servicesSettings.modality } }]
        : []),
      ...(normalizeIds(servicesSettings?.treatments).length
        ? [{ treatments: { in: normalizeIds(servicesSettings?.treatments) } }]
        : []),
      ...(normalizeIds(servicesSettings?.objective).length
        ? [{ objective: { in: normalizeIds(servicesSettings?.objective) } }]
        : []),
      ...(normalizeIds(servicesSettings?.area).length
        ? [{ area: { in: normalizeIds(servicesSettings?.area) } }]
        : []),
      ...(normalizeIds(servicesSettings?.intent).length
        ? [{ intent: { in: normalizeIds(servicesSettings?.intent) } }]
        : []),
      ...(normalizeIds(servicesSettings?.zone).length
        ? [{ zone: { in: normalizeIds(servicesSettings?.zone) } }]
        : []),
    ],
  }

  const servicesResult = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    limit: servicesLimit,
    depth: 1,
    where: servicesWhere,
    sort: '-createdAt',
  })

  const fallbackImage = {
    url: '/media/493b3205c13b5f67b36cf794c2222583.jpg',
    alt: t.services.title,
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
          service.badge && typeof service.badge === 'object' && 'label' in service.badge
            ? String((service.badge as { label?: string }).label || '')
            : null,
        href: service.slug ? `/${locale}/services/service/${service.slug}` : undefined,
      }
    })
    .filter((item) => Boolean(item && item.title))

  return (
    <div className={styles.page}>
      {hasHero && (
        <Hero
          eyebrow={t.story.title}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
        />
      )}
      <StoryHeroNote
        locale={locale}
        title={pageDoc?.storyNoteLabel || undefined}
        body={pageDoc?.storyNoteBody || undefined}
        ctaLabel={pageDoc?.storyNoteCtaLabel || undefined}
        ctaHref={pageDoc?.storyNoteCtaHref || undefined}
        media={storyNoteMedia ? { url: storyNoteMedia.url, alt: storyNoteMedia.alt } : null}
      />
      {storyValuesItems.length > 0 && <StoryValuesSection items={storyValuesItems} />}
      {(storyTeamItems.length > 0 || pageDoc?.storyTeam?.title || pageDoc?.storyTeam?.description) && (
        <StoryTeamSection
          title={pageDoc?.storyTeam?.title || undefined}
          description={pageDoc?.storyTeam?.description || undefined}
          items={storyTeamItems}
        />
      )}
      {serviceItems.length > 0 && (
        <UICCarousel
          items={serviceItems}
          ariaLabel="Services carousel"
          emptyLabel="Nessun servizio disponibile."
        />
      )}
    </div>
  )
}
