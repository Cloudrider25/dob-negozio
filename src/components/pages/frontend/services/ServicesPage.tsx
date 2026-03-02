import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { Hero } from '@/components/heroes/Hero'
import { NavigatorDataProvider } from '@/components/services/navigator-data-context'
import { ListinoTradizionale } from '@/components/services/ListinoTradizionale'
import { ConsulenzaSection } from '@/components/shared/ConsulenzaSection'
import { ServicesSectionSwitcher } from '@/components/services/ServicesSectionSwitcher'
import { ServiceBuilderSplitSection } from '@/components/services/ServiceBuilderSplitSection'
import type { NavigatorData } from '@/components/services/navigator-data-context'
import type {
  AreaData,
  GoalData,
  ServiceFinal,
  TreatmentData,
} from '@/components/services/service-navigator.types'
import { buildContactLinks } from '@/lib/contact'
import { resolveGalleryCover, resolveMedia } from '@/components/shared/media'
import { normalizeRichText } from '@/components/shared/richtext'

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ view?: string; q?: string }>
}) {
  const { locale } = await params
  const viewParam = (await searchParams)?.view?.trim()
  const queryParam = (await searchParams)?.q?.trim()

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
  const heroDark = resolveMedia(heroMedia?.[0], t.services.title)
  const heroLight = resolveMedia(heroMedia?.[1], t.services.title)
  const hasHero = Boolean(heroDark || heroLight)
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle ? pageDoc.heroTitle : t.services.title
  const heroDescription = pageDoc?.heroDescription ?? t.services.lead
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'

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
  const initialViewMode =
    viewParam === 'listino' || viewParam === 'consulenza'
      ? viewParam
      : queryParam
        ? 'listino'
        : 'navigator'

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
      <ServicesSectionSwitcher currentView={initialViewMode} />
      {initialViewMode === 'navigator' ? (
        <div className="mt-[2.5vw]">
          <ServiceBuilderSplitSection data={navigatorData} />
        </div>
      ) : null}
      {initialViewMode === 'consulenza' ? (
        <section className="mt-[2.5vw] w-full bg-[var(--bg)] px-[2.5vw] py-20">
          <ConsulenzaSection contactLinks={contactLinks} />
        </section>
      ) : null}
      {initialViewMode === 'listino' ? (
        <section className="mt-[2.5vw] w-full bg-transparent pb-16">
          <NavigatorDataProvider data={navigatorData}>
            <ListinoTradizionale />
          </NavigatorDataProvider>
        </section>
      ) : null}
    </div>
  )
}
