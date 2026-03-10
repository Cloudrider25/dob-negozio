import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { getServiceBySlug, getServices } from '@/lib/server/services/queries'
import { getDictionary, isLocale } from '@/lib/i18n/core'
import styles from '@/frontend/page-domains/services/pages/service-detail/page/ServiceDetailPage.module.css'
import { Carousel } from '@/frontend/components/carousel/ui/Carousel'
import { createCarouselItem } from '@/frontend/components/carousel/shared/mappers'
import type { Program, Treatment } from '@/payload/generated/payload-types'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { LabelText } from '@/frontend/components/ui/primitives/label'
import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'
import { UILeadGallery } from '@/frontend/components/ui/compositions/LeadGallery'
import { LeadPanel } from '@/frontend/components/ui/compositions/LeadPanel'
import { LeadHeader } from '@/frontend/components/ui/compositions/LeadHeader'
import { ServiceChooseOptions } from '../sections/ServiceChooseOptions'
import { InlineVideo } from '@/frontend/components/shared/InlineVideo'
import { DetailFaqSection } from '@/frontend/components/shared/DetailFaqSection'
import { DetailInsideSection } from '@/frontend/components/shared/DetailInsideSection'
import { DetailAccordion } from '@/frontend/components/shared/DetailAccordion'
import { ProgramsSplitSection } from '@/frontend/page-domains/home/sections/ProgramsSplitSection'
import type { ServiceDetailRouteParams } from '../internal/types'
import {
  escapeHtml,
  formatDuration,
  formatPrice,
  formatServiceType,
  normalizeBullets,
  renderRichText,
  resolveGalleryCover,
  resolveGalleryItems,
  resolveMediaFromId,
  resolveRelationLabel,
  resolveTreatmentLabel,
} from '../internal/helpers'
import { resolveMedia } from '@/lib/frontend/media/resolve'

export default async function ServiceDetailPage({ params }: { params: ServiceDetailRouteParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const service = await getServiceBySlug({
    payload,
    locale,
    slug,
    depth: 1,
  })
  if (!service) {
    notFound()
  }

  const servicesResult = await getServices({
    payload,
    locale,
    depth: 1,
    limit: 6,
    sort: '-createdAt',
    where: {
      active: { equals: true },
    },
  })

  const resolveTreatmentFromValue = async (value: unknown): Promise<Treatment | null> => {
    if (!value) return null
    if (typeof value === 'object') return value as Treatment
    if (typeof value === 'string' || typeof value === 'number') {
      return payload.findByID({
        collection: 'treatments',
        id: String(value),
        locale,
        depth: 1,
        overrideAccess: false,
      }) as Promise<Treatment>
    }
    return null
  }

  const resolveProgramFromValue = async (value: unknown): Promise<Program | null> => {
    if (!value) return null
    if (typeof value === 'object') return value as Program
    if (typeof value === 'string' || typeof value === 'number') {
      return payload.findByID({
        collection: 'programs',
        id: String(value),
        locale,
        depth: 1,
        overrideAccess: false,
      }) as Promise<Program>
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

  const resolveMediaValue = async (value: unknown, fallbackAlt = '') => {
    const mediaDoc = await resolveMediaFromId(payload, value)
    return mediaDoc ? resolveMedia(mediaDoc, fallbackAlt) : null
  }

  const resolveGallerySecondary = async (gallery: unknown, fallbackAlt: string) => {
    const items = await resolveGalleryItems(payload, gallery, fallbackAlt)
    const secondary = items.find((item) => !item.isCover) ?? items[1] ?? items[0]
    return secondary ? secondary.media : null
  }

  const resolveProductMedia = async (product: unknown, fallbackAlt: string) => {
    if (!product || typeof product !== 'object') return null
    const record = product as { coverImage?: unknown; images?: unknown[] }
    const gallery = Array.isArray(record.images) ? record.images : []
    const mediaDoc = await resolveMediaFromId(payload, record.coverImage || gallery[0])
    return mediaDoc ? resolveMedia(mediaDoc, fallbackAlt) : null
  }

  const treatmentsList = Array.isArray(service.treatments) ? service.treatments : []
  const primaryTreatmentValue = treatmentsList[0]
  const parentTreatment = await resolveTreatmentFromValue(primaryTreatmentValue)
  const relatedProgram = await resolveProgramFromValue(service.relatedProgram)

  const categoryLabel = resolveTreatmentLabel(parentTreatment)
  const badgeLabel = resolveTreatmentLabel(service.badge)

  const chooseOptions = [
    {
      id: 'default',
      name:
        typeof service.nomeVariabile === 'string' && service.nomeVariabile.trim()
          ? service.nomeVariabile.trim()
          : 'Default',
      durationMinutes:
        typeof service.durationMinutes === 'number' && service.durationMinutes > 0
          ? service.durationMinutes
          : null,
      price: typeof service.price === 'number' && service.price >= 0 ? service.price : null,
    },
    ...(Array.isArray(service.variabili)
      ? service.variabili.map((item, index) => ({
          id: `variabile:${index}`,
          name:
            typeof item?.varNome === 'string' && item.varNome.trim()
              ? item.varNome.trim()
              : `Variabile ${index + 1}`,
          durationMinutes:
            typeof item?.varDurationMinutes === 'number' && item.varDurationMinutes > 0
              ? item.varDurationMinutes
              : null,
          price: typeof item?.varPrice === 'number' && item.varPrice >= 0 ? item.varPrice : null,
        }))
      : []),
  ]

  const packageOptions = Array.isArray(service.pacchetti)
    ? service.pacchetti.map((item, index) => ({
        id:
          typeof item?.id === 'string' && item.id.trim()
            ? item.id.trim()
            : `pkg-${index}`,
        name:
          typeof item?.nomePacchetto === 'string' && item.nomePacchetto.trim()
            ? item.nomePacchetto.trim()
            : `Pacchetto ${index + 1}`,
        sessions:
          typeof item?.numeroSedute === 'number' && item.numeroSedute > 0 ? item.numeroSedute : null,
        packagePrice:
          typeof item?.prezzoPacchetto === 'number' && item.prezzoPacchetto >= 0
            ? item.prezzoPacchetto
            : null,
        packageValue:
          typeof item?.valorePacchetto === 'number' && item.valorePacchetto >= 0
            ? item.valorePacchetto
            : null,
        linkedTo:
          typeof item?.collegaAVariabile === 'string' && item.collegaAVariabile.trim()
            ? item.collegaAVariabile.trim()
            : 'default',
      }))
    : []

  const galleryItems = await resolveGalleryItems(payload, service.gallery, service.name || t.services.title)
  const coverMedia = await resolveGalleryCover(payload, service.gallery, service.name || t.services.title)
  const imageUrl = coverMedia?.url ?? null
  const imageAlt = coverMedia?.alt ?? (service.name || t.services.title)

  const galleryFallback = galleryItems.find((item) => !item.isCover)?.media ?? coverMedia ?? null

  const includedMedia = await resolveMediaFromId(payload, service.includedMedia)
  const includedResolved = includedMedia
    ? resolveMedia(includedMedia, service.name || t.services.title)
    : null
  const includedContent = renderRichText(service.includedDescription)
  const includedDescriptionHtml = includedContent?.type === 'html' ? includedContent.value : null
  const includedLeadText =
    includedContent?.type === 'text'
      ? includedContent.value
      : service.name
        ? t.services.detail.includedLeadWithService.replace('{{service}}', service.name)
        : t.services.detail.includedLead

  const faqMedia = await resolveMediaFromId(payload, service.faqMedia)
  const faqResolved = faqMedia ? resolveMedia(faqMedia, service.name || t.services.title) : null

  const videoUpload = await resolveMediaFromId(payload, service.videoUpload)
  const videoMedia = videoUpload
    ? resolveMedia(videoUpload, service.name || t.services.title)
    : null
  const videoPoster = await resolveMediaFromId(payload, service.videoPoster)
  const videoPosterMedia = videoPoster
    ? resolveMedia(videoPoster, service.name || t.services.title)
    : null

  const videoEmbed =
    typeof service.videoEmbedUrl === 'string' && service.videoEmbedUrl
      ? service.videoEmbedUrl
      : service.slug === 'is-clinical-foaming-enzyme-treatment-90-min'
        ? 'https://www.youtube.com/embed/HI7yqyPBEdA'
        : ''

  const fallbackImage = imageUrl
    ? { url: imageUrl, alt: imageAlt }
    : { url: '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg', alt: t.services.title }

  const relatedProgramSteps =
    relatedProgram && Array.isArray(relatedProgram.steps)
      ? await Promise.all(
          relatedProgram.steps.map(async (step) => {
            const stepServiceId =
              step.stepType === 'service' ? resolveProgramId(step.stepService) : null
            const stepProductId =
              step.stepType === 'product' ? resolveProgramId(step.stepProduct) : null
            const stepService =
              stepServiceId
                ? await payload.findByID({
                    collection: 'services',
                    id: stepServiceId,
                    locale,
                    depth: 1,
                    overrideAccess: false,
                  })
                : null
            const stepProduct =
              stepProductId
                ? await payload.findByID({
                    collection: 'products',
                    id: stepProductId,
                    locale,
                    depth: 1,
                    overrideAccess: false,
                  })
                : null

            const fallbackTitle = stepService?.name || stepProduct?.title || ''
            const fallbackSubtitle = stepService?.description || stepProduct?.description || ''
            const heroMedia =
              (await resolveMediaValue(step.stepHeroMedia, fallbackTitle)) ||
              (stepService
                ? await resolveGalleryCover(payload, stepService.gallery, fallbackTitle)
                : await resolveProductMedia(stepProduct, fallbackTitle)) ||
              null
            const detailMedia =
              (await resolveMediaValue(step.stepDetailMedia, fallbackTitle)) ||
              (stepService
                ? await resolveGallerySecondary(stepService.gallery, fallbackTitle)
                : stepProduct && Array.isArray(stepProduct.images)
                  ? await resolveMediaValue(stepProduct.images[1], fallbackTitle)
                  : null) ||
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

  const relatedProgramData = relatedProgram
    ? {
        title: relatedProgram.title || undefined,
        description: relatedProgram.description || undefined,
        price:
          typeof relatedProgram.price === 'number' && !Number.isNaN(relatedProgram.price)
            ? new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: relatedProgram.currency || 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(relatedProgram.price)
            : undefined,
        slug: relatedProgram.slug || undefined,
        heroMedia: await resolveMediaValue(relatedProgram.heroMedia, relatedProgram.title || ''),
        steps: relatedProgramSteps,
      }
    : null

  const serviceItems: CarouselItem[] = servicesResult.docs
    .map((doc) => {
      const galleryMedia =
        Array.isArray(doc.gallery) && doc.gallery.length
          ? resolveMedia(
              (doc.gallery.find((item) => item?.isCover)?.media as unknown) ??
                (doc.gallery[0]?.media as unknown),
              doc.name || '',
            )
          : null
      const media = galleryMedia || fallbackImage
      return createCarouselItem({
        id: doc.id,
        slug: doc.slug || undefined,
        title: doc.name,
        subtitle: doc.description || undefined,
        price: formatPrice(locale, doc.price) || null,
        duration: formatDuration(doc.durationMinutes) || null,
        image: { url: media.url, alt: media.alt },
        tag: formatServiceType(doc.serviceType),
        badgeLeft: resolveRelationLabel(doc.intent),
        badgeRight: resolveRelationLabel(doc.badge),
        href: doc.slug ? `/${locale}/services/service/${doc.slug}` : undefined,
      })
    })
    .filter((item): item is CarouselItem => Boolean(item))

  return (
    <div className={`frontend-page ${styles.page}`}>
      <SplitSection
        className={styles.leadSection}
        left={
          <UILeadGallery
            cover={coverMedia ? { url: coverMedia.url, alt: coverMedia.alt } : null}
            items={galleryItems.map((item) => ({
              media: item.media ? { url: item.media.url, alt: item.media.alt } : undefined,
              mediaType: item.mediaType,
            }))}
            showProgress
            classNames={{
              media: styles.heroMedia,
            }}
          />
        }
        right={
          <LeadPanel className={styles.heroPanel}>
            <LeadHeader
              title={
                <SectionTitle as="h1" size="h1" className={styles.title}>
                  {service.name}
                </SectionTitle>
              }
              badge={badgeLabel !== '—' ? badgeLabel : formatServiceType(service.serviceType)}
              between={
                <>
                  {service.tagline ? (
                    <div className={`${styles.eyebrow} typo-caption-upper`}>{service.tagline}</div>
                  ) : null}
                  <div className={`${styles.subtitleRow} typo-small-upper`}>
                    <span className={styles.subtitle}>{categoryLabel}</span>
                  </div>
                </>
              }
              titleRowClassName={styles.titleRow}
              badgeClassName={`${styles.badge} typo-caption-upper`}
            />

            <div className={styles.divider} />

            <div className={styles.relatedBlock}>
              {chooseOptions.length > 1 ? <LabelText variant="section">Scegli</LabelText> : null}
              <ServiceChooseOptions
                serviceId={String(service.id)}
                serviceSlug={service.slug || undefined}
                options={chooseOptions}
                packages={packageOptions}
                serviceName={service.name || 'servizio'}
                locale={locale}
                coverImage={coverMedia?.url ?? null}
              />
            </div>

            <DetailAccordion
              items={[
                ...(service.results
                  ? [
                      {
                        id: 'benefits',
                        title: 'Benefici',
                        body: (() => {
                          const bullets = normalizeBullets(service.results)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          const content = renderRichText(service.results)
                          if (!content) return null
                          return content.type === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: content.value }} />
                          ) : (
                            <p>{content.value}</p>
                          )
                        })(),
                      },
                    ]
                  : []),
                ...(service.indications
                  ? [
                      {
                        id: 'application',
                        title: 'Aree trattate e indicazioni',
                        body: (() => {
                          const bullets = normalizeBullets(service.indications)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          const content = renderRichText(service.indications)
                          if (!content) return null
                          return content.type === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: content.value }} />
                          ) : (
                            <p>{content.value}</p>
                          )
                        })(),
                      },
                    ]
                  : []),
                ...(service.techProtocolShort
                  ? [
                      {
                        id: 'ingredients',
                        title: 'Tecnologia e protocollo',
                        body: (() => {
                          const bullets = normalizeBullets(service.techProtocolShort)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          const content = renderRichText(service.techProtocolShort)
                          if (!content) return null
                          return content.type === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: content.value }} />
                          ) : (
                            <p>{content.value}</p>
                          )
                        })(),
                      },
                    ]
                  : []),
                ...(service.downtime
                  ? [
                      {
                        id: 'downtime',
                        title: 'Downtime',
                        body: (() => {
                          const bullets = normalizeBullets(service.downtime)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          const content = renderRichText(service.downtime)
                          if (!content) return null
                          return content.type === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: content.value }} />
                          ) : (
                            <p>{content.value}</p>
                          )
                        })(),
                      },
                    ]
                  : []),
              ]}
              classNames={{
                root: styles.accordion,
                item: styles.accordionItem,
                trigger: styles.accordionTrigger,
                icon: styles.accordionIcon,
                panel: styles.accordionPanel,
                cta: styles.accordionCta,
              }}
              iconClassName="typo-body"
            />
          </LeadPanel>
        }
      />

      <section className={styles.videoSection} aria-label="Service video">
        <div className={styles.videoWrap}>
          {videoMedia ? (
            <InlineVideo
              src={videoMedia.url}
              poster={videoPosterMedia?.url || imageUrl || undefined}
              label="Service video"
            />
          ) : videoEmbed ? (
            <iframe
              className={styles.video}
              src={videoEmbed}
              title="Service video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={styles.videoPlaceholder}>
              {(videoPosterMedia?.url || imageUrl) && (
                <Image
                  src={videoPosterMedia?.url || imageUrl || ''}
                  alt={videoPosterMedia?.alt || imageAlt}
                  fill
                  className={styles.videoPoster}
                  loading="lazy"
                  fetchPriority="auto"
                />
              )}
              <div className={`${styles.videoOverlay} typo-small-upper`}>Video placeholder</div>
            </div>
          )}
        </div>
      </section>

      <DetailInsideSection
        ariaLabel="Cosa include il trattamento"
        title="what's included"
        mediaUrl={includedResolved?.url || imageUrl || null}
        mediaAlt={includedResolved?.alt || imageAlt}
        includedDescriptionHtml={includedDescriptionHtml}
        includedLeadText={includedLeadText}
        classNames={{
          section: styles.insideSection,
          rightColumn: styles.insideColumn,
          media: styles.insideMedia,
          image: styles.insideImage,
          zoomLayer: styles.insideZoomLayer,
          placeholder: styles.insidePlaceholder,
          content: styles.insideContent,
          contentExpanded: styles.insideContentExpanded,
          label: styles.insideLabel,
          labelMobile: styles.insideLabelMobile,
          labelDesktop: styles.insideLabelDesktop,
          lead: styles.insideLead,
          rich: styles.insideRich,
        }}
      />

      <DetailFaqSection
        ariaLabel="FAQ"
        title={service.faqTitle || 'FAQ'}
        subtitle={
          service.faqSubtitle ||
          (service.name
            ? t.services.detail.faqSubtitleWithService.replace('{{service}}', service.name)
            : t.services.detail.faqSubtitle)
        }
        items={
          Array.isArray(service.faqItems)
            ? service.faqItems
                .map((item) => {
                  const question = typeof item?.q === 'string' ? item.q : ''
                  if (!question) return null
                  const answerContent = renderRichText(item?.a)
                  if (!answerContent) {
                    return { question, answerHtml: '' }
                  }
                  const html =
                    answerContent.type === 'html'
                      ? answerContent.value
                      : `<p>${escapeHtml(answerContent.value)}</p>`
                  return { question, answerHtml: html }
                })
                .filter(Boolean) as Array<{ question: string; answerHtml: string }>
            : []
        }
        media={
          faqResolved?.url || galleryFallback?.url || imageUrl
            ? {
                url: faqResolved?.url || galleryFallback?.url || imageUrl || '',
                alt: faqResolved?.alt || galleryFallback?.alt || imageAlt,
              }
            : null
        }
        mobileOrder="right-first"
        classNames={{
          section: styles.faqSection,
          copy: styles.faqCopy,
          title: styles.faqTitle,
          subtitle: styles.faqSubtitle,
          media: styles.faqMedia,
          image: styles.faqImage,
          placeholder: styles.faqPlaceholder,
        }}
      />

      {relatedProgramData ? <ProgramsSplitSection program={relatedProgramData} locale={locale} /> : null}

      <section aria-label="Altri servizi">
        <Carousel
          items={serviceItems}
          ariaLabel="Services carousel"
          emptyLabel="Nessun servizio disponibile."
        />
      </section>
    </div>
  )
}
