import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { getServices } from '@/lib/server/services/queries'
import { Hero } from '@/frontend/components/heroes/Hero'
import { NavigatorDataProvider } from '@/frontend/page-domains/services/pages/services-page/sections/navigator-data-context'
import { ListinoTradizionale } from '@/frontend/page-domains/services/pages/services-page/sections/ListinoTradizionale'
import { ConsulenzaSection } from '@/frontend/page-domains/shared/sections/ConsulenzaSection'
import { ServicesSectionSwitcher } from '@/frontend/page-domains/services/pages/services-page/sections/ServicesSectionSwitcher'
import { ServiceBuilderSplitSection } from '@/frontend/page-domains/services/pages/services-page/sections/ServiceBuilderSplitSection'
import type { NavigatorData } from '@/frontend/page-domains/services/pages/services-page/sections/navigator-data-context'
import type {
  AreaData,
  GoalData,
  ServiceFinal,
  TreatmentData,
} from '@/frontend/page-domains/services/pages/services-page/sections/service-navigator.types'
import { buildContactLinks } from '@/lib/frontend/contact/links'
import { resolveGalleryCover, resolveMedia } from '@/lib/frontend/media/resolve'
import { normalizeRichText } from '@/lib/frontend/services/richtext'
import styles from '@/frontend/page-domains/services/pages/services-page/page/ServicesPage.module.css'

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
  try {
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
    const step0Media = resolveMedia(pageDoc?.serviceNavigator?.step0Media, 'Inizia il percorso')
    const navigatorStep0Config = {
      heading: pageDoc?.serviceNavigator?.step0Heading || null,
      description: pageDoc?.serviceNavigator?.step0Description || null,
      mediaPlaceholder: pageDoc?.serviceNavigator?.step0MediaPlaceholder || null,
      mediaUrl: step0Media?.url || null,
      mediaAlt: step0Media?.alt || null,
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
      getServices({
        payload,
        locale,
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
          variabili: true,
          pacchetti: true,
          nomeVariabile: true,
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
      variabili: Array.isArray(service.variabili)
        ? service.variabili
            .map((item) => ({
              id: String(item?.id || ''),
              name: item?.varNome || service.nomeVariabile || 'Default',
              durationMinutes: typeof item?.varDurationMinutes === 'number' ? item.varDurationMinutes : null,
              price: typeof item?.varPrice === 'number' ? item.varPrice : undefined,
            }))
            .filter((item) => item.id.length > 0)
        : [],
      pacchetti: Array.isArray(service.pacchetti)
        ? service.pacchetti
            .map((item) => ({
              id: String(item?.id || ''),
              name: item?.nomePacchetto || 'Pacchetto',
              linkedTo: item?.collegaAVariabile || 'default',
              sessions: typeof item?.numeroSedute === 'number' ? item.numeroSedute : null,
              packagePrice: typeof item?.prezzoPacchetto === 'number' ? item.prezzoPacchetto : undefined,
              packageValue: typeof item?.valorePacchetto === 'number' ? item.valorePacchetto : null,
            }))
            .filter((item) => item.id.length > 0)
        : [],
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
    viewParam === 'navigator' || viewParam === 'listino' || viewParam === 'consulenza'
      ? viewParam
      : 'listino'

    return (
      <div className={styles.page}>
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
          <div className={styles.navigatorSection}>
            <ServiceBuilderSplitSection data={navigatorData} step0Config={navigatorStep0Config} />
          </div>
        ) : null}
        {initialViewMode === 'consulenza' ? (
          <section className={styles.consultationSection}>
            <ConsulenzaSection contactLinks={contactLinks} />
          </section>
        ) : null}
        {initialViewMode === 'listino' ? (
          <section className={styles.listinoSection}>
            <NavigatorDataProvider data={navigatorData}>
              <ListinoTradizionale />
            </NavigatorDataProvider>
          </section>
        ) : null}
      </div>
    )
  } catch (error) {
    console.error(`[services] Failed to render services page (${locale}).`, error)

    return (
      <div className={styles.page}>
        <Hero
          eyebrow={t.services.title}
          title={t.services.title}
          description={t.services.lead}
          variant="style1"
        />
      </div>
    )
  }
}
