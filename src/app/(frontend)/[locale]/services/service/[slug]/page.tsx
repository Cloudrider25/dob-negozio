import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'
import styles from './service-detail.module.css'
import { ServiceAccordion } from './ServiceAccordion'
import { UICCarousel } from '@/components/carousel/UIC_Carousel'
import { ServicesTreatmentReveal } from '@/components/services/ServicesTreatmentReveal'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import type { Treatment } from '@/payload-types'
import type { ServicesCarouselItem } from '@/components/carousel/types'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { LabelText } from '@/components/ui/label'
import { SplitSection } from '@/components/ui/SplitSection'
import { UILeadGallery } from '@/components/ui/LeadGallery'
import { LeadPanel } from '@/components/ui/LeadPanel'
import { LeadHeader } from '@/components/ui/LeadHeader'
import { ServiceChooseOptions } from './ServiceChooseOptions'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function ServiceDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const result = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const service = result.docs[0]
  if (!service) {
    notFound()
  }

  const servicesResult = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 6,
    where: {
      active: { equals: true },
    },
    sort: '-createdAt',
  })

  const resolveMediaFromId = async (value: unknown) => {
    if (!value) return null
    if (typeof value === 'object' && 'url' in value) return value as { url?: string; alt?: string }
    if (typeof value === 'string' || typeof value === 'number') {
      try {
        return await payload.findByID({
          collection: 'media',
          id: String(value),
          depth: 0,
          overrideAccess: false,
        })
      } catch {
        return null
      }
    }
    return null
  }

  const resolveMedia = (value: unknown, fallbackAlt = '') => {
    if (!value || typeof value !== 'object' || !('url' in value)) return null
    const typed = value as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt, mimeType: typed.mimeType || null }
  }

  const resolveGalleryItems = async (gallery: unknown, fallbackAlt: string) => {
    if (!Array.isArray(gallery)) return []
    const entries = gallery
      .map((item) =>
        item && typeof item === 'object'
          ? (item as { media?: unknown; isCover?: boolean; mediaType?: string | null })
          : null,
      )
      .filter(Boolean)
    const resolved = await Promise.all(
      entries.map(async (entry) => {
        if (!entry?.media) return null
        const mediaDoc = await resolveMediaFromId(entry.media)
        const media = mediaDoc ? resolveMedia(mediaDoc, fallbackAlt) : null
        if (!media) return null
        const inferredType =
          entry.mediaType ||
          (media.mimeType && media.mimeType.startsWith('video/') ? 'video' : 'image')
        return {
          media,
          isCover: Boolean(entry.isCover),
          mediaType: inferredType,
        }
      }),
    )
    return resolved.filter(Boolean) as Array<{
      media: { url: string; alt: string; mimeType: string | null }
      isCover: boolean
      mediaType: string | null
    }>
  }

  const resolveGalleryCover = async (gallery: unknown, fallbackAlt: string) => {
    const items = await resolveGalleryItems(gallery, fallbackAlt)
    const cover = items.find((item) => item.isCover) ?? items[0]
    return cover ? cover.media : null
  }

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

  const treatmentsList = Array.isArray(service.treatments) ? service.treatments : []
  const primaryTreatmentValue = treatmentsList[0]
  const parentTreatment = await resolveTreatmentFromValue(primaryTreatmentValue)
  const parentTitle =
    parentTreatment && typeof parentTreatment.boxName === 'string' ? parentTreatment.boxName : null
  const parentDescription =
    parentTreatment && typeof parentTreatment.description === 'string'
      ? parentTreatment.description
      : null
  const parentTagline =
    parentTreatment && typeof parentTreatment.boxTagline === 'string'
      ? parentTreatment.boxTagline
      : null

  const primaryMediaCandidates = [
    parentTreatment && 'heroImage' in parentTreatment ? parentTreatment.heroImage : null,
    parentTreatment && 'cardMedia' in parentTreatment ? parentTreatment.cardMedia : null,
  ]

  const resolveFirstMedia = async (candidates: Array<unknown>) => {
    for (const candidate of candidates) {
      const resolved = await resolveMediaFromId(candidate)
      if (resolved && typeof resolved.url === 'string') return resolved
    }
    return null
  }

  const primaryMedia = await resolveFirstMedia(primaryMediaCandidates)
  const parentImageUrl =
    primaryMedia && typeof primaryMedia.url === 'string' ? primaryMedia.url : null
  const parentImageAlt =
    primaryMedia && typeof primaryMedia.alt === 'string'
      ? primaryMedia.alt
      : parentTitle || service.name || t.services.title

  const treatmentHref =
    parentTreatment && typeof parentTreatment === 'object' && 'slug' in parentTreatment
      ? `/${locale}/services/treatment/${String((parentTreatment as { slug?: string }).slug)}`
      : undefined

  const formatPrice = (value?: number | null) => {
    if (typeof value !== 'number') return '—'
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    })
    return formatter.format(value)
  }

  const formatServiceType = (value?: string | null) => {
    if (value === 'package') return 'Pacchetto'
    if (value === 'single') return 'Singolo'
    return '—'
  }

  const formatDuration = (minutes?: number | null) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) return undefined
    return `${minutes} min`
  }

  const resolveRelationLabel = (value: unknown) => {
    if (!value) return null
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const label =
        (typeof record.label === 'string' && record.label) ||
        (typeof record.name === 'string' && record.name)
      if (label) return label
    }
    return null
  }

  const renderRichText = (value: unknown) => {
    if (!value) return null
    if (typeof value === 'string') {
      return { type: 'text', value }
    }
    if (typeof value === 'object') {
      try {
        const data =
          value && typeof value === 'object' && 'root' in value
            ? (value as SerializedEditorState)
            : null
        if (!data) return null
        const html = convertLexicalToHTML({ data })
        return html ? { type: 'html', value: html } : null
      } catch {
        return null
      }
    }
    return null
  }

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

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

  const extractText = (node: unknown, acc: string[]) => {
    if (!node || typeof node !== 'object') return
    const record = node as { text?: string; children?: unknown[] }
    if (typeof record.text === 'string') acc.push(record.text)
    if (Array.isArray(record.children)) record.children.forEach((child) => extractText(child, acc))
  }

  const richTextBullets = (value: unknown) => {
    if (!value || typeof value !== 'object') return []
    const root = (value as { root?: unknown }).root
    if (!root) return []
    const bullets: string[] = []
    extractBullets(root, bullets)
    return bullets
  }

  const normalizeBullets = (value: unknown) => {
    if (typeof value === 'string') {
      return value
        .split('\n')
        .map((line) => line.replace(/^[\s•*-]+/, '').trim())
        .filter(Boolean)
    }
    return richTextBullets(value)
  }

  const resolveTreatmentLabel = (value: unknown) => {
    if (!value) return '—'
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const name =
        (typeof record.boxName === 'string' && record.boxName) ||
        (typeof record.cardName === 'string' && record.cardName) ||
        (typeof record.name === 'string' && record.name)
      if (name) return name
      if (typeof record.id === 'string' || typeof record.id === 'number') return String(record.id)
    }
    return '—'
  }

  const categoryLabel = resolveTreatmentLabel(parentTreatment)
  const badgeLabel = resolveTreatmentLabel(service.badge)
  const resolveRelId = (value: unknown) => {
    if (!value) return null
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    if (typeof value === 'object' && 'id' in value) {
      const idValue = (value as { id?: string | number }).id
      return idValue ? String(idValue) : null
    }
    return null
  }

  const intentId = resolveRelId(service.intent)
  const zoneId = resolveRelId(service.zone)
  const genderValue = typeof service.gender === 'string' ? service.gender : null

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
        id: `pkg-${index}`,
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

  const galleryItems = await resolveGalleryItems(service.gallery, service.name || t.services.title)
  const coverMedia = await resolveGalleryCover(service.gallery, service.name || t.services.title)
  const imageUrl = coverMedia?.url ?? null
  const imageAlt = coverMedia?.alt ?? (service.name || t.services.title)

  const galleryFallback = galleryItems.find((item) => !item.isCover)?.media ?? coverMedia ?? null

  const includedMedia = await resolveMediaFromId(service.includedMedia)
  const includedResolved = includedMedia
    ? resolveMedia(includedMedia, service.name || t.services.title)
    : null
  const includedContent = renderRichText(service.includedDescription)

  const faqMedia = await resolveMediaFromId(service.faqMedia)
  const faqResolved = faqMedia ? resolveMedia(faqMedia, service.name || t.services.title) : null

  const videoUpload = await resolveMediaFromId(service.videoUpload)
  const videoMedia = videoUpload
    ? resolveMedia(videoUpload, service.name || t.services.title)
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

  let alternativeServiceItems: ServicesCarouselItem[] = []
  if (intentId && zoneId && genderValue) {
    const altResult = await payload.find({
      collection: 'services',
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 10,
      where: {
        and: [
          { id: { not_equals: String(service.id) } },
          { active: { equals: true } },
          { intent: { equals: intentId } },
          { zone: { equals: zoneId } },
          { gender: { equals: genderValue } },
        ],
      },
    })

    alternativeServiceItems = (
      await Promise.all(
        altResult.docs.map(async (doc) => {
          const media = await resolveGalleryCover(doc.gallery, doc.name || t.services.title)
          if (!doc.name || !doc.slug) return null
          return {
            title: doc.name,
            subtitle: doc.description || undefined,
            price: formatPrice(doc.price),
            duration: formatDuration(doc.durationMinutes),
            image: {
              url: media?.url || fallbackImage.url,
              alt: media?.alt || doc.name,
            },
            tag: formatServiceType(doc.serviceType),
            badgeLeft: resolveRelationLabel(doc.intent),
            badgeRight: resolveRelationLabel(doc.badge),
            href: `/${locale}/services/service/${doc.slug}`,
          }
        }),
      )
    ).filter(Boolean) as ServicesCarouselItem[]
  }

  const serviceItems: ServicesCarouselItem[] = servicesResult.docs
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
      return {
        title: doc.name || '',
        subtitle: doc.description || undefined,
        price: formatPrice(doc.price),
        duration: formatDuration(doc.durationMinutes),
        image: { url: media.url, alt: media.alt },
        tag: formatServiceType(doc.serviceType),
        badgeLeft: resolveRelationLabel(doc.intent),
        badgeRight: resolveRelationLabel(doc.badge),
        href: doc.slug ? `/${locale}/services/service/${doc.slug}` : undefined,
      }
    })
    .filter((item) => Boolean(item && item.title))

  return (
    <div className={styles.page}>
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
              <LabelText variant="section">Scegli</LabelText>
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

            <ServiceAccordion
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
            />
          </LeadPanel>
        }
      />

      <section className={styles.videoSection} aria-label="Service video">
        <div className={styles.videoWrap}>
          {videoMedia ? (
            <video className={styles.video} src={videoMedia.url} controls playsInline preload="none" />
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
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
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

      <section className={styles.insideSection} aria-label="Cosa include il trattamento">
        <SplitSection
          leftClassName={styles.insideMedia}
          rightClassName={styles.insideContent}
          left={
            includedResolved?.url || imageUrl ? (
              <Image
                src={includedResolved?.url || imageUrl || ''}
                alt={includedResolved?.alt || imageAlt}
                fill
                className={styles.insideImage}
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                fetchPriority="auto"
              />
            ) : (
              <div className={styles.insidePlaceholder} />
            )
          }
          right={
            <>
              <SectionTitle as="div" size="h1" uppercase className={styles.insideLabel}>
                what&apos;s included
              </SectionTitle>
              {includedContent ? (
                includedContent.type === 'html' ? (
                  <div
                    className={`${styles.insideRich} typo-body`}
                    dangerouslySetInnerHTML={{ __html: includedContent.value }}
                  />
                ) : (
                  <SectionSubtitle className={styles.insideLead}>{includedContent.value}</SectionSubtitle>
                )
              ) : (
                <SectionSubtitle className={styles.insideLead}>
                  {service.name ? `Scopri cosa include ${service.name}.` : ''}
                </SectionSubtitle>
              )}
            </>
          }
        />
      </section>

      <section className={styles.faqSection} aria-label="FAQ">
        <SplitSection
          left={
            <div className={styles.faqCopy}>
              <SectionTitle as="h2" size="h1" uppercase className={styles.faqTitle}>
                {service.faqTitle || 'FAQ'}
              </SectionTitle>
              <SectionSubtitle className={styles.faqSubtitle}>
                {service.faqSubtitle || `Scopri di più su ${service.name || 'questo trattamento'}.`}
              </SectionSubtitle>
              {Array.isArray(service.faqItems) && service.faqItems.length ? (
                <FaqAccordion
                  items={
                    service.faqItems
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
                  }
                />
              ) : null}
            </div>
          }
          right={
            <div className={styles.faqMedia}>
              {faqResolved?.url || galleryFallback?.url || imageUrl ? (
                <Image
                  src={faqResolved?.url || galleryFallback?.url || imageUrl || ''}
                  alt={faqResolved?.alt || galleryFallback?.alt || imageAlt}
                  fill
                  className={styles.faqImage}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  fetchPriority="auto"
                />
              ) : (
                <div className={styles.faqPlaceholder} />
              )}
            </div>
          }
        />
      </section>

      <ServicesTreatmentReveal
        primary={{
          title: parentTitle || service.name || 'Protocol overview',
          body: (
            <SectionSubtitle className={styles.treatmentText}>
              {parentTagline || parentDescription || ''}
            </SectionSubtitle>
          ),
          imageUrl: parentImageUrl,
          imageAlt: parentImageAlt || undefined,
          rail: ['Click here', 'Trattamenti alternativi'],
          href: treatmentHref,
        }}
        secondary={{
          title: 'Trattamenti Alternativi',
          body: null,
          rail: ['Click here', 'Trattamenti alternativi'],
          href: treatmentHref,
          mediaBody: (
            <div className={styles.treatmentCarousel}>
              {alternativeServiceItems.length > 0 ? (
                <UICCarousel
                  items={alternativeServiceItems}
                  single
                  cardClassName={styles.altCarouselCard}
                  mediaClassName={styles.altCarouselMedia}
                  ariaLabel="Alternative services carousel"
                  emptyLabel="Nessun servizio disponibile."
                />
              ) : (
                <SectionSubtitle className={styles.treatmentText}>
                  Il servizio scelto è unico nel suo genere e non ha alternative.
                </SectionSubtitle>
              )}
            </div>
          ),
        }}
      />

      <section aria-label="Altri servizi">
        <UICCarousel
          items={serviceItems}
          ariaLabel="Services carousel"
          emptyLabel="Nessun servizio disponibile."
        />
      </section>
    </div>
  )
}
