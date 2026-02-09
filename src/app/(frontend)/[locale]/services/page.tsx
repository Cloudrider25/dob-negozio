import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { Hero } from '@/components/Hero'
import { ServiceNavigatorSection } from '@/components/service-navigator/ServiceNavigatorSection'
import type { NavigatorData } from '@/components/service-navigator/data/navigator-data-context'
import type {
  AreaData,
  GoalData,
  ServiceFinal,
  TreatmentData,
} from '@/components/service-navigator/types/navigator'
import { buildContactLinks } from '@/lib/contact'

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
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
        equals: 'services',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown, fallbackAlt: string = t.services.title) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt, mimeType: typed.mimeType || null }
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
  const heroDark = resolveMedia(heroMedia?.[0])
  const heroLight = resolveMedia(heroMedia?.[1])
  const hasHero = Boolean(heroDark || heroLight)
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle ? pageDoc.heroTitle : t.services.title
  const heroDescription = pageDoc?.heroDescription ?? t.services.lead
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'

  const extractText = (node: unknown, acc: string[]) => {
    if (!node || typeof node !== 'object') return
    const record = node as { text?: string; children?: unknown[] }
    if (typeof record.text === 'string') {
      acc.push(record.text)
    }
    if (Array.isArray(record.children)) {
      record.children.forEach((child) => extractText(child, acc))
    }
  }

  const extractBullets = (node: unknown, acc: string[]) => {
    if (!node || typeof node !== 'object') return
    const record = node as { type?: string; children?: unknown[] }
    if (record.type === 'list' && Array.isArray(record.children)) {
      record.children.forEach((child) => {
        const parts: string[] = []
        extractText(child, parts)
        const text = parts.join(' ').replace(/\s+/g, ' ').trim()
        if (text) acc.push(text)
      })
    }
    if (Array.isArray(record.children)) {
      record.children.forEach((child) => extractBullets(child, acc))
    }
  }

  const normalizeRichText = (value: unknown) => {
    if (!value || typeof value !== 'object') return { text: '', bullets: [] as string[] }
    const root = (value as { root?: unknown }).root
    if (!root) return { text: '', bullets: [] as string[] }
    const textParts: string[] = []
    const bullets: string[] = []
    extractText(root, textParts)
    extractBullets(root, bullets)
    const text = textParts.join(' ').replace(/\s+/g, ' ').trim()
    return { text, bullets }
  }

  const [areasResult, objectivesResult, treatmentsResult, servicesResult, siteSettings] =
    await Promise.all([
      payload.find({
        collection: 'areas',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'createdAt',
      }),
      payload.find({
        collection: 'objectives',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'createdAt',
      }),
      payload.find({
        collection: 'treatments',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'createdAt',
      }),
      payload.find({
        collection: 'services',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 500,
        sort: 'price',
        where: {
          active: { equals: true },
        },
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          slug: true,
          description: true,
          price: true,
          treatments: true,
          gallery: true,
        },
      }),
      payload.findGlobal({
        slug: 'site-settings',
        locale,
        overrideAccess: false,
      }),
    ])

  const areas: AreaData[] = areasResult.docs.map((area) => {
    const media = resolveMedia(area.cardMedia)
    const rich = normalizeRichText(area.cardDescription)
    return {
      id: String(area.id),
      label: area.name || '',
      description: area.boxTagline || '',
      subtitle: area.cardTagline || undefined,
      slug: area.slug || undefined,
      imageUrl: media?.url || undefined,
      features: rich.bullets.length ? rich.bullets : undefined,
      cardTitle: area.cardTitle || undefined,
      cardTagline: area.cardTagline || undefined,
      cardDescription: rich.text || undefined,
    }
  })

  const goals: GoalData[] = objectivesResult.docs.map((goal) => {
    const media = resolveMedia(goal.cardMedia)
    const rich = normalizeRichText(goal.cardDescription)
    const areaId =
      typeof goal.area === 'object' && goal.area && 'id' in goal.area
        ? String(goal.area.id)
        : goal.area
          ? String(goal.area)
          : undefined
    return {
      id: String(goal.id),
      label: goal.boxName || '',
      subtitle: goal.boxTagline || undefined,
      description: goal.boxTagline || '',
      slug: goal.slug || undefined,
      benefits: rich.bullets.length ? rich.bullets : undefined,
      areaId,
      imageUrl: media?.url || undefined,
      cardTitle: goal.cardName || goal.boxName || undefined,
      cardTagline: goal.cardTagline || undefined,
      cardDescription: rich.text || undefined,
    }
  })

  const treatments: TreatmentData[] = treatmentsResult.docs.map((treatment) => {
    const media = resolveMedia(treatment.cardMedia)
    const rich = normalizeRichText(treatment.cardDescription)
    const references = Array.isArray(treatment.reference) ? treatment.reference : []
    const referenceIds = references
      .map((ref) => {
        if (ref && typeof ref === 'object' && 'value' in ref) {
          const value = (ref as { value?: unknown }).value
          if (value && typeof value === 'object' && 'id' in value) {
            return String((value as { id?: string | number }).id)
          }
          if (typeof value === 'string' || typeof value === 'number') {
            return String(value)
          }
        }
        if (typeof ref === 'string' || typeof ref === 'number') return String(ref)
        return ''
      })
      .filter(Boolean)

    return {
      id: String(treatment.id),
      label: treatment.boxName || treatment.cardName || '',
      description: treatment.boxTagline || '',
      subtitle: treatment.cardTagline || undefined,
      slug: treatment.slug || undefined,
      imageUrl: media?.url || undefined,
      features: rich.bullets.length ? rich.bullets : undefined,
      referenceIds,
      cardTitle: treatment.cardName || treatment.boxName || undefined,
      cardTagline: treatment.cardTagline || undefined,
      cardDescription: rich.text || undefined,
    }
  })

  const services: ServiceFinal[] = servicesResult.docs.map((service) => {
    const durationMin = typeof service.durationMinutes === 'number' ? service.durationMinutes : 0
    const treatmentsList = Array.isArray(service.treatments) ? service.treatments : []
    const serviceMedia = resolveGalleryCover(service.gallery, service.name || t.services.title)
    const treatmentIds = treatmentsList
      .map((item) => {
        if (item && typeof item === 'object' && 'id' in item) return String(item.id)
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return ''
      })
      .filter(Boolean)
    return {
      id: String(service.id),
      title: service.name || '',
      slug: service.slug || undefined,
      durationMin,
      tags: service.slug ? [service.slug] : [],
      treatmentIds,
      description: service.description || undefined,
      price: service.price || undefined,
      imageUrl: serviceMedia?.url || undefined,
    }
  })

  const treatmentsWithServices = new Set<string>()
  for (const service of services) {
    for (const treatmentId of service.treatmentIds) {
      treatmentsWithServices.add(treatmentId)
    }
  }

  const filteredTreatments = treatments.filter((treatment) =>
    treatmentsWithServices.has(treatment.id),
  )

  const goalsWithTreatments = new Set<string>()
  for (const treatment of filteredTreatments) {
    for (const referenceId of treatment.referenceIds) {
      goalsWithTreatments.add(referenceId)
    }
  }

  const filteredGoals = goals.filter((goal) => goalsWithTreatments.has(goal.id))

  const areasWithChildren = new Set<string>()
  for (const goal of filteredGoals) {
    if (goal.areaId) areasWithChildren.add(goal.areaId)
  }
  for (const treatment of filteredTreatments) {
    for (const referenceId of treatment.referenceIds) {
      areasWithChildren.add(referenceId)
    }
  }

  const filteredAreas = areas.filter((area) => areasWithChildren.has(area.id))

  const navigatorData: NavigatorData = {
    areas: filteredAreas,
    goals: filteredGoals,
    treatments: filteredTreatments,
    services,
  }
  const contactLinks = buildContactLinks({
    phone: siteSettings?.phone,
    whatsapp: siteSettings?.whatsapp,
  })
  return (
    <div className="flex flex-col gap-0">
      {hasHero && (
        <Hero
          eyebrow={t.services.title}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
        />
      )}
      <ServiceNavigatorSection data={navigatorData} contactLinks={contactLinks} />
    </div>
  )
}
