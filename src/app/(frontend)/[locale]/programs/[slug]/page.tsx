import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'
import { SplitSection } from '@/components/ui/SplitSection'
import { ButtonLink } from '@/components/ui/button-link'
import styles from './program-detail.module.css'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function ProgramDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)
  const copy = {
    it: {
      stepLabel: 'Step',
      stepMediaAlt: 'Media step programma',
      singleTreatmentsCost: 'Costo dei singoli trattamenti',
      programFullPrice: 'Prezzo programma completo',
      book: 'Prenota',
      includedInPrice: 'incluso nel prezzo',
      details: 'Dettagli',
    },
    en: {
      stepLabel: 'Step',
      stepMediaAlt: 'Program step media',
      singleTreatmentsCost: 'Single treatments total',
      programFullPrice: 'Full program price',
      book: 'Book',
      includedInPrice: 'included in the price',
      details: 'Details',
    },
    ru: {
      stepLabel: 'Этап',
      stepMediaAlt: 'Медиа этапа программы',
      singleTreatmentsCost: 'Стоимость отдельных процедур',
      programFullPrice: 'Полная стоимость программы',
      book: 'Записаться',
      includedInPrice: 'включено в стоимость',
      details: 'Подробнее',
    },
  }[locale]

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
        item && typeof item === 'object' ? (item as { media?: unknown; isCover?: boolean }) : null,
      )
      .filter(Boolean)
    const cover = entries.find((entry) => entry?.isCover) ?? entries[0]
    return cover?.media ? resolveMedia(cover.media, fallbackAlt) : null
  }

  const resolveGallerySecondary = (gallery: unknown, fallbackAlt: string) => {
    if (!Array.isArray(gallery)) return null
    const entries = gallery
      .map((item) =>
        item && typeof item === 'object' ? (item as { media?: unknown; isCover?: boolean }) : null,
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

  const formatPrice = (value?: number | null, currency?: string | null) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return undefined
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const steps =
    program && Array.isArray(program.steps)
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
            const detailHref = service?.slug
              ? `/${locale}/services/service/${service.slug}`
              : product?.slug
                ? `/${locale}/shop/${product.slug}`
                : null
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
              rawPrice: service?.price ?? product?.price ?? null,
              price: formatPrice(
                service?.price ?? product?.price ?? null,
                program.currency || 'EUR',
              ),
              detailHref,
              heroMedia,
              detailMedia,
            }
          }),
        )
      : []

  const stepsTotalRaw = steps.reduce((sum, step) => {
    if (typeof step.rawPrice !== 'number' || Number.isNaN(step.rawPrice)) return sum
    return sum + step.rawPrice
  }, 0)
  const stepsTotalPrice =
    stepsTotalRaw > 0 ? formatPrice(stepsTotalRaw, program.currency || 'EUR') : undefined

  const programData = {
    title: program.title || undefined,
    description: program.description || undefined,
    price: formatProgramPrice(program.price, program.currency) || undefined,
    slug: program.slug || undefined,
    heroMedia: await resolveMediaValue(program.heroMedia, program.title || t.hero.title),
    steps,
    stepsTotalPrice,
  }

  const programHref = programData.slug ? `/${locale}/programs/${programData.slug}` : null
  const bookingHref = `/${locale}/services?view=consulenza`

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={`${styles.heroTitle} typo-h2`}>{programData.title}</h1>
        {programData.description ? (
          <p className={`${styles.heroSubtitle} typo-body`}>{programData.description}</p>
        ) : null}
        {programData.price || programData.stepsTotalPrice ? (
          <p className={`${styles.heroPrice} typo-h3`}>
            {programData.stepsTotalPrice ? (
              <span className={styles.heroPriceOld}>
                <span className={styles.heroPriceOldValue}>{programData.stepsTotalPrice}</span>{' '}
                {copy.singleTreatmentsCost}
              </span>
            ) : null}
            {programData.price ? (
              <span className={styles.heroPriceDepositRow}>
                <span className={styles.heroPriceDeposit}>
                  {copy.programFullPrice} {programData.price}
                </span>
                <ButtonLink
                  className={`${styles.heroPriceBookingCta} typo-caption-upper`}
                  href={bookingHref}
                  kind="main"
                  size="sm"
                >
                  {copy.book} {programData.title}
                </ButtonLink>
              </span>
            ) : null}
          </p>
        ) : null}
      </section>

      {programData.steps.map((step, index) => {
        const media = step.detailMedia || step.heroMedia || programData.heroMedia
        const isMediaLeft = index % 2 === 0
        const stepDisplayTitle = step.title || `${programData.title} ${copy.stepLabel} ${index + 1}`
        const stepCtaTitle = step.title || programData.title
        const stepCtaPrice = step.price || programData.price
        const hasStepActions = Boolean(programHref || step.detailHref)
        const mediaPanel = (
          <div className={styles.mediaPanel}>
            {media?.url ? (
              <Image
                src={media.url}
                alt={media.alt || step.title || programData.title || copy.stepMediaAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
                loading="lazy"
                fetchPriority="auto"
              />
            ) : null}
          </div>
        )

        const infoPanel = (
          <div className={styles.infoPanel}>
            <div className={styles.infoTop}>
              <p className={`${styles.stepCount} typo-caption-upper`}>
                {index + 1}/{programData.steps.length}
              </p>
              {step.badge ? (
                <p className={`${styles.stepBadge} typo-small-upper`}>{step.badge}</p>
              ) : null}
            </div>
            <h2 className={`${styles.stepTitle} typo-h3`}>{stepDisplayTitle}</h2>
            {step.subtitle ? (
              <p className={`${styles.stepSubtitle} typo-body`}>{step.subtitle}</p>
            ) : null}
            {hasStepActions ? (
              <div className={styles.stepActions}>
                {programHref ? (
                  <Link className={`${styles.stepCta} typo-caption-upper`} href={programHref}>
                    <span>{stepCtaTitle}</span>
                    {stepCtaPrice ? (
                      <span className={styles.stepCtaMeta}>
                        <span className={styles.stepCtaPriceOld}>{stepCtaPrice}</span>
                        <span className={styles.stepCtaDeposit}>{copy.includedInPrice}</span>
                      </span>
                    ) : null}
                  </Link>
                ) : null}
                {step.detailHref ? (
                  <ButtonLink
                    className={`${styles.stepDetailCta} typo-caption-upper`}
                    href={step.detailHref}
                    kind="main"
                    size="sm"
                  >
                    {copy.details}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </div>
        )

        return (
          <SplitSection
            key={step.id || `${programData.slug || 'program'}-${index}`}
            className={styles.stepSplit}
            leftClassName={`${styles.stepColumn} ${isMediaLeft ? styles.columnMedia : styles.columnInfo}`}
            rightClassName={`${styles.stepColumn} ${isMediaLeft ? styles.columnInfo : styles.columnMedia}`}
            left={isMediaLeft ? mediaPanel : infoPanel}
            right={isMediaLeft ? infoPanel : mediaPanel}
          />
        )
      })}
    </div>
  )
}
