import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { SerializedEditorState } from 'lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'
import styles from './product-detail.module.css'
import { AlternativeSelector } from './AlternativeSelector'
import { ProductServiceAccordion } from './ProductServiceAccordion'
import { ProductInlineVideo } from './ProductInlineVideo'
import { ProductInsideSection } from './ProductInsideSection'
import { ProductTreatmentReveal } from '@/components/shop/ProductTreatmentReveal'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { UICCarousel } from '@/components/carousel/UIC_Carousel'
import type { ServicesCarouselItem } from '@/components/carousel/types'
import { ButtonLink } from '@/components/ui/button-link'
import { SplitSection } from '@/components/ui/SplitSection'
import { UILeadGallery } from '@/components/ui/LeadGallery'
import { ScrollZoomOnScroll } from '@/components/ui/ScrollZoomOnScroll'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)
  const copy = t.productDetail

  const result = await payload.find({
    collection: 'products',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const product = result.docs[0]
  if (!product) {
    notFound()
  }

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
    const resolved = await Promise.all(
      gallery.map(async (entry) => {
        const mediaDoc = await resolveMediaFromId(entry)
        const media = mediaDoc ? resolveMedia(mediaDoc, fallbackAlt) : null
        if (!media) return null
        return {
          media,
          mediaType: media.mimeType && media.mimeType.startsWith('video/') ? 'video' : 'image',
        }
      }),
    )
    return resolved.filter(Boolean) as Array<{
      media: { url: string; alt: string; mimeType: string | null }
      mediaType: string | null
    }>
  }

  const coverMedia = resolveMedia(product.coverImage, product.title || '')
  const galleryItems = await resolveGalleryItems(product.images, product.title || '')
  const cartCoverImage = coverMedia?.url ?? galleryItems[0]?.media?.url ?? null

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

  const resolveRichTextHtml = (value: unknown): string | null => {
    if (!value || typeof value !== 'object' || !('root' in value)) return null
    try {
      return convertLexicalToHTML({ data: value as SerializedEditorState }) || null
    } catch {
      return null
    }
  }

  const resolveText = (value: unknown) => {
    if (!value) return null
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const localized = record[locale]
      if (typeof localized === 'string') return localized
      const first = Object.values(record).find((entry) => typeof entry === 'string')
      if (typeof first === 'string') return first
    }
    return null
  }

  const normalizeBullets = (value?: string | null) => {
    if (!value) return []
    return value
      .split('\n')
      .map((line) => line.replace(/^[\s•*-]+/, '').trim())
      .filter(Boolean)
  }

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const withProduct = (template: string, productName?: string | null) => {
    const fallbackName = productName || t.placeholders.productName
    return template.replace('{{product}}', fallbackName)
  }

  const resolveProductMedia = (value: unknown, fallbackAlt: string) => {
    if (!value || typeof value !== 'object') return null
    if (!('url' in value)) return null
    const typed = value as { url?: string | null; alt?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt }
  }

  const resolveBrandLabel = (brand: typeof product.brand) => {
    if (!brand || typeof brand === 'number') return null
    const rawName = brand.name
    if (typeof rawName === 'string') return rawName
    if (rawName && typeof rawName === 'object') {
      const localized = rawName as Record<string, unknown>
      const preferred = localized[locale]
      if (typeof preferred === 'string') return preferred
      const first = Object.values(localized).find((value) => typeof value === 'string')
      if (typeof first === 'string') return first
    }
    return null
  }

  const resolveRelationId = (value: unknown): string | null => {
    if (typeof value === 'number' || typeof value === 'string') return String(value)
    if (value && typeof value === 'object' && 'id' in value) {
      const id = (value as { id?: unknown }).id
      if (typeof id === 'number' || typeof id === 'string') return String(id)
    }
    return null
  }

  const brandLineId = resolveRelationId(product.brandLine)

  const resolveBrandLineDoc = async () => {
    if (product.brandLine && typeof product.brandLine === 'object' && 'slug' in product.brandLine) {
      return product.brandLine as {
        id?: number | string
        name?: unknown
        slug?: string
        lineHeadline?: unknown
        brandLineMedia?: unknown
        description?: unknown
        usage?: unknown
        activeIngredients?: unknown
        results?: unknown
      }
    }

    if (!brandLineId) return null

    try {
      const doc = await payload.findByID({
        collection: 'brand-lines',
        id: brandLineId,
        locale,
        depth: 1,
        overrideAccess: false,
      })
      return doc
    } catch {
      return null
    }
  }

  const brandLineDoc = await resolveBrandLineDoc()

  const relatedDocs = brandLineId
    ? (
        await payload.find({
          collection: 'products',
          locale,
          overrideAccess: false,
          depth: 1,
          limit: 4,
          where: {
            and: [
              { active: { equals: true } },
              { id: { not_equals: String(product.id) } },
              { brandLine: { equals: brandLineId } },
            ],
          },
        })
      ).docs
    : []

  const formatOptions = [
    {
      key: String(product.id),
      productId: String(product.id),
      slug: product.slug || '',
      title: product.title || t.shop.title,
      format: product.format || '',
      isRefill: product.isRefill === true,
      price: product.price ?? null,
      currency: 'EUR',
      coverImage: cartCoverImage,
      brand: resolveBrandLabel(product.brand),
      isCurrent: true,
    },
    ...(Array.isArray(product.alternatives)
      ? product.alternatives.map((alt, index) => {
          const relatedId =
            typeof alt?.product === 'object' && alt.product && 'id' in alt.product
              ? String((alt.product as { id?: string | number }).id || '')
              : ''
          return {
            key: String(alt?.id || `alt-${index}`),
            productId: relatedId || String(alt?.id || `alt-${index}`),
            slug:
              (typeof alt?.product === 'object' && alt.product && 'slug' in alt.product
                ? (alt.product as { slug?: string | null }).slug
                : null) ||
              product.slug ||
              '',
            title:
              (typeof alt?.product === 'object' && alt.product && 'title' in alt.product
                ? (alt.product as { title?: string | null }).title
                : null) ||
              product.title ||
              t.shop.title,
            format:
              alt?.format ||
              (typeof alt?.product === 'object' && alt.product && 'format' in alt.product
                ? (alt.product as { format?: string | null }).format
                : '') ||
              '',
            isRefill:
              alt?.isRefill === true ||
              (typeof alt?.product === 'object' && alt.product && 'isRefill' in alt.product
                ? (alt.product as { isRefill?: boolean | null }).isRefill === true
                : false),
            price:
              typeof alt?.price === 'number'
                ? alt.price
                : typeof alt?.product === 'object' && alt.product && 'price' in alt.product
                  ? ((alt.product as { price?: number | null }).price ?? null)
                  : null,
            currency: 'EUR',
            coverImage:
              typeof alt?.product === 'object' && alt.product && 'coverImage' in alt.product
                ? resolveProductMedia(
                    (alt.product as { coverImage?: unknown }).coverImage,
                    (alt.product as { title?: string | null }).title || product.title || '',
                  )?.url || null
                : null,
            brand: resolveBrandLabel(
              typeof alt?.product === 'object' && alt.product && 'brand' in alt.product
                ? (alt.product as { brand?: typeof product.brand }).brand
                : null,
            ),
            isCurrent: false,
          }
        })
      : []),
  ]
    .filter((doc) => {
      if (!doc.productId) return false
      if (doc.isCurrent) return true
      return Boolean(doc.slug && (doc.format || doc.isRefill))
    })
    .filter(
      (doc, index, list) =>
        list.findIndex((item) => item.format === doc.format && item.isRefill === doc.isRefill) ===
        index,
    )

  const addOnProduct = relatedDocs[0]

  const productsResult = await payload.find({
    collection: 'products',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 8,
    sort: '-createdAt',
    where: {
      active: { equals: true },
    },
  })

  const fallbackImage = coverMedia
    ? { url: coverMedia.url, alt: coverMedia.alt }
    : { url: '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg', alt: t.shop.title }

  const toCarouselItem = (doc: typeof product): ServicesCarouselItem | null => {
    const title = doc.title || ''
    if (!title) return null
    const media =
      resolveProductMedia(doc.coverImage, title) ||
      (Array.isArray(doc.images) ? resolveProductMedia(doc.images[0], title) : null) ||
      fallbackImage
    return {
      title,
      subtitle: doc.description || undefined,
      price: formatPrice(doc.price),
      duration: null,
      image: { url: media.url, alt: media.alt },
      tag: resolveBrandLabel(doc.brand),
      badgeLeft: null,
      badgeRight: null,
      href: doc.slug ? `/${locale}/shop/${doc.slug}` : undefined,
    }
  }

  const alternativeProductItems: ServicesCarouselItem[] = relatedDocs
    .map((doc) => toCarouselItem(doc))
    .filter(Boolean) as ServicesCarouselItem[]

  const productItems: ServicesCarouselItem[] = productsResult.docs
    .map((doc) => toCarouselItem(doc))
    .filter(Boolean) as ServicesCarouselItem[]

  const coverFallback =
    coverMedia ||
    (galleryItems.length
      ? { url: galleryItems[0].media.url, alt: galleryItems[0].media.alt }
      : null)

  const videoUpload = await resolveMediaFromId(product.videoUpload)
  const videoMedia = videoUpload ? resolveMedia(videoUpload, product.title || '') : null
  const videoEmbed =
    typeof product.videoEmbedUrl === 'string' && product.videoEmbedUrl ? product.videoEmbedUrl : ''
  const videoPoster = await resolveMediaFromId(product.videoPoster)
  const videoPosterMedia = videoPoster ? resolveMedia(videoPoster, product.title || '') : null

  const includedMediaDoc = await resolveMediaFromId(product.includedMedia)
  const includedResolved = includedMediaDoc
    ? resolveMedia(includedMediaDoc, product.title || '')
    : null
  const includedDescriptionHtml = resolveRichTextHtml(product.includedDescription)
  const includedCtaLabel = resolveText(product.includedLabel)
  const includedIngredientsLabel = resolveText(product.includedIngredientsLabel)
  const includedFooter = resolveText(product.includedFooter)
  const includedIngredientsItems = Array.isArray(product.includedIngredients)
    ? product.includedIngredients
        .map((item) => ({
          label: resolveText(item?.label) || '',
          description: resolveText(item?.description) || '',
        }))
        .filter((item) => item.label || item.description)
    : []

  const faqMediaDoc = await resolveMediaFromId(product.faqMedia)
  const faqResolved = faqMediaDoc ? resolveMedia(faqMediaDoc, product.title || '') : null

  const descriptionText = resolveText(product.description)
  const usageText = resolveText(product.usage)
  const ingredientsText = resolveText(product.activeIngredients)
  const resultsText = resolveText(product.results)
  const specsGoodForText = resolveText(product.specsGoodFor)
  const specsFeelsLikeText = resolveText(product.specsFeelsLike)
  const specsSmellsLikeText = resolveText(product.specsSmellsLike)
  const specsFYIText = resolveText(product.specsFYI)
  const faqTitleText = resolveText(product.faqTitle)
  const faqSubtitleText = resolveText(product.faqSubtitle)
  const brandLineName =
    resolveText(brandLineDoc?.name) ||
    resolveBrandLabel(product.brand) ||
    copy.treatment.primaryTitleFallback
  const brandLineHeadlineText = resolveText(brandLineDoc?.lineHeadline)
  const brandLineDescriptionText = resolveText(brandLineDoc?.description)
  const brandLineUsageText = resolveText(brandLineDoc?.usage)
  const brandLineIngredientsText = resolveText(brandLineDoc?.activeIngredients)
  const brandLineResultsText = resolveText(brandLineDoc?.results)
  const treatmentPrimaryTitle = resolveText(brandLineDoc?.name) || ''
  const specsMediaDoc = await resolveMediaFromId(product.specsMedia)
  const specsMediaResolved = specsMediaDoc ? resolveMedia(specsMediaDoc, product.title || '') : null
  const brandLineMediaDoc = await resolveMediaFromId(brandLineDoc?.brandLineMedia)
  const brandLineMediaResolved = brandLineMediaDoc
    ? resolveMedia(brandLineMediaDoc, brandLineName)
    : null
  const resolvedLineMedia = specsMediaResolved || brandLineMediaResolved
  const lineHeadline = brandLineHeadlineText || copy.lineHeadlineFallback

  const lineDetails = [
    {
      label: copy.lineDetails.goodFor,
      value:
        specsGoodForText || brandLineResultsText || resultsText || copy.lineDetails.goodForFallback,
    },
    {
      label: copy.lineDetails.feelsLike,
      value:
        specsFeelsLikeText ||
        brandLineDescriptionText ||
        descriptionText ||
        copy.lineDetails.feelsLikeFallback,
    },
    {
      label: copy.lineDetails.smellsLike,
      value: specsSmellsLikeText || copy.lineDetails.smellsLikeFallback,
    },
    {
      label: copy.lineDetails.fyi,
      value:
        specsFYIText || brandLineIngredientsText || ingredientsText || copy.lineDetails.fyiFallback,
    },
  ]

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
            styles={styles}
            mobilePeek
          />
        }
        right={
          <div className={styles.heroPanel}>
            <div className={styles.heroHeader}>
              <div className={styles.titleRow}>
                <SectionTitle as="h1" size="h2" className={styles.title}>
                  {product.title}
                </SectionTitle>
                <span className={`${styles.badge} typo-caption-upper`}>
                  {resolveBrandLabel(product.brand) || 'DOB'}
                </span>
              </div>

              <SectionSubtitle className={styles.description}>
                {descriptionText || ''}
              </SectionSubtitle>
            </div>

            <AlternativeSelector
              options={formatOptions}
              baseProduct={{
                id: String(product.id),
                title: product.title || t.shop.title,
                slug: product.slug || undefined,
                price: product.price ?? undefined,
                currency: 'EUR',
                brand: resolveBrandLabel(product.brand),
                coverImage: cartCoverImage,
              }}
              locale={locale}
              fallbackLabel={product.title || t.shop.title}
              className={`${styles.buyButton} typo-caption-upper`}
            />

            <div className={styles.divider} />

            {addOnProduct ? (
              <div className={styles.crossSell}>
                <div className={`${styles.crossSellTitle} typo-small-upper`}>
                  {copy.crossSell.title}
                </div>
                <div className={styles.crossSellRow}>
                  <div className={styles.crossSellItem}>
                    <div className={styles.crossSellThumb}>
                      <Image
                        src={
                          resolveProductMedia(addOnProduct.coverImage, addOnProduct.title || '')
                            ?.url || fallbackImage.url
                        }
                        alt={addOnProduct.title || t.placeholders.productName}
                        fill
                        sizes="42px"
                        loading="lazy"
                        fetchPriority="auto"
                      />
                    </div>
                    <div>
                      <div className={`${styles.crossSellName} typo-body-upper`}>
                        {addOnProduct.title || t.placeholders.productName}
                      </div>
                      <div className={`${styles.crossSellMeta} typo-small`}>
                        {copy.crossSell.meta}
                      </div>
                    </div>
                  </div>
                  <ButtonLink
                    className={`${styles.lineupButton} typo-caption-upper`}
                    href={
                      addOnProduct.slug ? `/${locale}/shop/${addOnProduct.slug}` : `/${locale}/shop`
                    }
                    kind="main"
                    size="sm"
                    interactive
                  >
                    {copy.crossSell.cta}
                  </ButtonLink>
                </div>
              </div>
            ) : null}

            <ProductServiceAccordion
              items={[
                ...(resultsText
                  ? [
                      {
                        id: 'benefits',
                        title: copy.accordion.benefits,
                        body: (() => {
                          const bullets = normalizeBullets(resultsText)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          return <p>{resultsText}</p>
                        })(),
                      },
                    ]
                  : []),
                ...(usageText
                  ? [
                      {
                        id: 'usage',
                        title: copy.accordion.usage,
                        body: (() => {
                          const bullets = normalizeBullets(usageText)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          return <p>{usageText}</p>
                        })(),
                      },
                    ]
                  : []),
                ...(ingredientsText
                  ? [
                      {
                        id: 'ingredients',
                        title: copy.accordion.ingredients,
                        body: (() => {
                          const bullets = normalizeBullets(ingredientsText)
                          if (bullets.length) {
                            return (
                              <ul>
                                {bullets.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )
                          }
                          return <p>{ingredientsText}</p>
                        })(),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        }
      />

      <section className={styles.videoSection} aria-label={copy.aria.productVideo}>
        <div className={styles.videoWrap}>
          {videoMedia ? (
            <ProductInlineVideo
              src={videoMedia.url}
              poster={videoPosterMedia?.url || coverFallback?.url || undefined}
              label={copy.aria.productVideo}
            />
          ) : videoEmbed ? (
            <iframe
              className={styles.video}
              src={videoEmbed}
              title={copy.aria.productVideo}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={styles.videoPlaceholder}>
              {(videoPosterMedia?.url || coverFallback?.url) && (
                <Image
                  src={videoPosterMedia?.url || coverFallback?.url || ''}
                  alt={videoPosterMedia?.alt || coverFallback?.alt || product.title || t.shop.title}
                  fill
                  className={styles.videoPoster}
                  loading="lazy"
                  fetchPriority="auto"
                />
              )}
              <div className={`${styles.videoOverlay} typo-small-upper`}>
                {copy.videoPlaceholder}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.lineSection} aria-label={copy.aria.productLine}>
        <SplitSection
          mobileOrder="right-first"
          left={
            <div className={styles.lineCopy}>
              <SectionTitle as="h2" size="h2" className={styles.lineTitle}>
                {lineHeadline.split(' ').map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className={index > 1 && index < 4 ? styles.lineTitleAccent : undefined}
                  >
                    {word}
                  </span>
                ))}
              </SectionTitle>
              <div className={styles.lineDetails}>
                {lineDetails.map((item) => (
                  <div key={item.label} className={styles.lineRow}>
                    <span className={`${styles.lineLabel} typo-small-upper`}>{item.label}</span>
                    <span className={`${styles.lineValue} typo-body`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          }
          right={
            <div className={styles.lineMedia}>
              {resolvedLineMedia?.url || coverFallback?.url ? (
                <Image
                  src={resolvedLineMedia?.url || coverFallback?.url || ''}
                  alt={
                    resolvedLineMedia?.alt || coverFallback?.alt || product.title || t.shop.title
                  }
                  fill
                  className={styles.lineImage}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  fetchPriority="auto"
                />
              ) : (
                <div className={styles.linePlaceholder} />
              )}
            </div>
          }
        />
      </section>

      <ProductInsideSection
        ariaLabel={copy.aria.whatsInside}
        title={copy.whatsInside.title}
        mediaUrl={includedResolved?.url || coverFallback?.url || null}
        mediaAlt={includedResolved?.alt || coverFallback?.alt || product.title || t.shop.title}
        includedDescriptionHtml={includedDescriptionHtml}
        includedIngredientsLabel={includedIngredientsLabel}
        includedIngredientsItems={includedIngredientsItems}
        includedFooter={includedFooter}
        includedCtaLabel={includedCtaLabel}
      />

      <section className={styles.faqSection} aria-label={copy.aria.faq}>
        <SplitSection
          mobileOrder="right-first"
          left={
            <div className={styles.faqCopy}>
              <SectionTitle as="h2" size="h1" uppercase className={styles.faqTitle}>
                {faqTitleText || copy.faq.titleFallback}
              </SectionTitle>
              <SectionSubtitle className={styles.faqSubtitle}>
                {faqSubtitleText ||
                  (product.title
                    ? withProduct(copy.faq.subtitleWithProduct, product.title)
                    : copy.faq.subtitleFallback)}
              </SectionSubtitle>
              {Array.isArray(product.faqItems) && product.faqItems.length ? (
                <FaqAccordion
                  items={
                    product.faqItems
                      .map((item) => {
                        const question = resolveText(item?.q) || ''
                        if (!question) return null
                        const answer = resolveText(item?.a) || ''
                        return {
                          question,
                          answerHtml: answer
                            ? `<p>${escapeHtml(answer).replace(/\n/g, '<br />')}</p>`
                            : '',
                        }
                      })
                      .filter(Boolean) as Array<{ question: string; answerHtml: string }>
                  }
                />
              ) : (
                <FaqAccordion
                  items={copy.faq.fallbackItems.map((item, index) => ({
                    question: item.question,
                    answerHtml:
                      index === 0 && usageText
                        ? `<p>${escapeHtml(usageText).replace(/\n/g, '<br />')}</p>`
                        : `<p>${escapeHtml(item.answer).replace(/\n/g, '<br />')}</p>`,
                  }))}
                />
              )}
            </div>
          }
          right={
            <div className={styles.faqMedia}>
              {faqResolved?.url || coverFallback?.url ? (
                <ScrollZoomOnScroll className={styles.faqZoomLayer}>
                  <Image
                    src={faqResolved?.url || coverFallback?.url || ''}
                    alt={faqResolved?.alt || coverFallback?.alt || product.title || t.shop.title}
                    fill
                    className={styles.faqImage}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    fetchPriority="auto"
                  />
                </ScrollZoomOnScroll>
              ) : (
                <div className={styles.faqPlaceholder} />
              )}
            </div>
          }
        />
      </section>

      <ProductTreatmentReveal
        primary={{
          title: treatmentPrimaryTitle,
          copyDetails: [
            {
              label: 'Description',
              value: brandLineDescriptionText || '',
            },
            {
              label: "Modo d'uso",
              value: brandLineUsageText || '',
            },
            {
              label: 'Principi attivi',
              value: brandLineIngredientsText || '',
            },
            {
              label: 'Risultati',
              value: brandLineResultsText || '',
            },
          ],
          body: null,
          railBody: [],
          imageUrl: brandLineMediaResolved?.url || null,
          imageAlt: brandLineMediaResolved?.alt || treatmentPrimaryTitle || undefined,
          rail: [copy.treatment.railTop, copy.treatment.railBottom],
          href: `/${locale}/shop`,
        }}
        secondary={{
          title: copy.treatment.secondaryTitle,
          body: null,
          rail: [copy.treatment.railTop, copy.treatment.railBottom],
          href: undefined,
          mediaBody: (
            <div className={styles.treatmentCarousel}>
              {alternativeProductItems.length > 0 ? (
                <UICCarousel
                  items={alternativeProductItems}
                  single
                  cardClassName={styles.altCarouselCard}
                  mediaClassName={styles.altCarouselMedia}
                  ariaLabel={copy.treatment.alternativesAria}
                  emptyLabel={copy.treatment.carouselEmpty}
                />
              ) : (
                <SectionSubtitle className={styles.treatmentText}>
                  {copy.treatment.noAlternatives}
                </SectionSubtitle>
              )}
            </div>
          ),
        }}
      />

      <section className={styles.moreProductsSection} aria-label={copy.aria.moreProducts}>
        <UICCarousel
          items={productItems}
          ariaLabel={copy.treatment.shopCarouselAria}
          emptyLabel={copy.treatment.carouselEmpty}
        />
      </section>
    </div>
  )
}
