import { notFound } from 'next/navigation'

import { Hero } from '@/frontend/components/heroes/Hero'
import { ProgramsSplitSection } from '@/frontend/page-domains/home/sections/ProgramsSplitSection'
import styles from '@/frontend/page-domains/programs/pages/programs-page/page/ProgramsPage.module.css'
import { resolveGalleryCover, resolveGallerySecondary, resolveMedia } from '@/lib/frontend/media/resolve'
import { getDictionary, isLocale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

type PageParams = Promise<{ locale: string }>

const resolveMediaValue = async (payload: Awaited<ReturnType<typeof getPayloadClient>>, value: unknown, fallbackAlt = '') => {
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

const resolveProgramId = (value: unknown) => {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: string | number }).id
    return idValue ? String(idValue) : null
  }
  return null
}

const formatProgramPrice = (locale: string, value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const resolveProductMedia = (product: unknown, fallbackAlt: string) => {
  if (!product || typeof product !== 'object') return null
  const record = product as { coverImage?: unknown; images?: unknown[] }
  const gallery = Array.isArray(record.images) ? record.images : []
  return resolveMedia(record.coverImage || gallery[0], fallbackAlt)
}

export default async function ProgramsPage({ params }: { params: PageParams }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const [pageConfig, programsResult] = await Promise.all([
    payload.find({
      collection: 'pages',
      locale,
      overrideAccess: false,
      limit: 1,
      depth: 1,
      where: {
        pageKey: {
          equals: 'programs',
        },
      },
    }),
    payload.find({
      collection: 'programs',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 100,
      sort: 'createdAt',
      where: {
        active: {
          equals: true,
        },
      },
    }),
  ])

  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc.heroMedia : []
  const heroDark = resolveMedia(heroMedia[0], t.programs.title)
  const heroLight = resolveMedia(heroMedia[1], t.programs.title)
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle ? pageDoc.heroTitle : t.programs.title
  const heroDescription = pageDoc?.heroDescription ?? t.programs.lead
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'

  const programs = await Promise.all(
    programsResult.docs.map(async (program) => {
      const steps =
        Array.isArray(program.steps)
          ? await Promise.all(
              program.steps.map(async (step) => {
                const serviceId =
                  step.stepType === 'service' ? resolveProgramId(step.stepService) : null
                const productId =
                  step.stepType === 'product' ? resolveProgramId(step.stepProduct) : null
                const service = serviceId
                  ? await payload.findByID({
                      collection: 'services',
                      id: serviceId,
                      locale,
                      depth: 1,
                      overrideAccess: false,
                    })
                  : null
                const product = productId
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
                    : resolveMedia(
                        product && Array.isArray(product.images) ? product.images[1] : null,
                        fallbackTitle,
                      )) ||
                  heroMedia ||
                  null

                return {
                  id: step.id || `${program.id}-${fallbackTitle}`,
                  title: step.stepTitle || fallbackTitle,
                  subtitle: step.stepSubtitle || fallbackSubtitle,
                  badge: step.stepBadge || null,
                  heroMedia,
                  detailMedia,
                }
              }),
            )
          : []

      return {
        id: String(program.id),
        title: program.title || undefined,
        description: program.description || undefined,
        price: formatProgramPrice(locale, program.price) || undefined,
        slug: program.slug || undefined,
        heroMedia: await resolveMediaValue(payload, program.heroMedia, program.title || t.programs.title),
        steps,
      }
    }),
  )

  return (
    <div className={`frontend-page ${styles.page}`}>
      <Hero
        title={heroTitle}
        description={heroDescription}
        variant={heroStyle}
        mediaDark={heroDark}
        mediaLight={heroLight}
        ariaLabel={t.programs.title}
      />
      <section className={styles.sections} aria-label={t.programs.title}>
        {programs.map((program) => (
          <ProgramsSplitSection key={program.id} program={program} locale={locale} />
        ))}
      </section>
    </div>
  )
}
