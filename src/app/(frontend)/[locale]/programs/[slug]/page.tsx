import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'
import { ProgramsSplitSection } from '@/components/sections/ProgramsSplitSection'
import styles from './program-detail.module.css'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function ProgramDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const programResult = await payload.find({
    collection: 'programs',
    locale,
    overrideAccess: false,
    depth: 0,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })
  const program = programResult.docs[0]

  if (!program) {
    notFound()
  }

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

  const resolveProductMedia = (product: unknown, fallbackAlt: string) => {
    if (!product || typeof product !== 'object') return null
    const record = product as { coverImage?: unknown; images?: unknown[] }
    const gallery = Array.isArray(record.images) ? record.images : []
    return resolveMedia(record.coverImage || gallery[0], fallbackAlt)
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

  const steps =
    program && Array.isArray(program.steps)
      ? await Promise.all(
          program.steps.map(async (step) => {
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
                : resolveMedia(
                    product && Array.isArray(product.images) ? product.images[1] : null,
                    fallbackTitle,
                  )) ||
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

  const programData = {
    title: program.title || undefined,
    description: program.description || undefined,
    price: formatProgramPrice(program.price, program.currency) || undefined,
    slug: program.slug || undefined,
    heroMedia: await resolveMediaValue(program.heroMedia, program.title || t.hero.title),
    steps,
  }

  return (
    <div className={styles.page}>
      <ProgramsSplitSection program={programData} locale={locale} />
    </div>
  )
}
