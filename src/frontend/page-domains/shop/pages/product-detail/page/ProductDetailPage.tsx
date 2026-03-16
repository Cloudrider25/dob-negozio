import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n/core'
import styles from '@/frontend/page-domains/shop/pages/product-detail/page/ProductDetailPage.module.css'
import { AlternativeSelector } from '@/frontend/page-domains/shop/pages/product-detail/sections/AlternativeSelector'
import { ProductAnalyticsTracker } from '@/frontend/page-domains/shop/pages/product-detail/sections/ProductAnalyticsTracker'
import type { ProductDetailRouteParams } from '@/frontend/page-domains/shop/pages/product-detail/internal/contracts'
import {
  escapeHtml,
  formatPrice,
  normalizeBullets,
  resolveBadgeLabel,
  resolveBrandLabel,
  resolveGalleryItems,
  resolveMediaFromId,
  resolveProductMedia,
  resolveRelationId,
  resolveRichTextHtml,
  resolveText,
  withProduct,
} from '@/frontend/page-domains/shop/pages/product-detail/internal/shared'
import { resolveMedia } from '@/lib/frontend/media/resolve'
import { DetailTreatmentReveal } from '@/frontend/components/shared/DetailTreatmentReveal'
import { InlineVideo } from '@/frontend/components/shared/InlineVideo'
import { DetailFaqSection } from '@/frontend/components/shared/DetailFaqSection'
import { DetailInsideSection } from '@/frontend/components/shared/DetailInsideSection'
import { DetailAccordion } from '@/frontend/components/shared/DetailAccordion'
import { Carousel } from '@/frontend/components/carousel/ui/Carousel'
import { createCarouselItem } from '@/frontend/components/carousel/shared/mappers'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import { ButtonLink } from '@/frontend/components/ui/primitives/button-link'
import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'
import { UILeadGallery } from '@/frontend/components/ui/compositions/LeadGallery'
import { LeadPanel } from '@/frontend/components/ui/compositions/LeadPanel'
import { LeadHeader } from '@/frontend/components/ui/compositions/LeadHeader'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'

export default async function ProductDetailPage({ params }: { params: ProductDetailRouteParams }) {
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

  const coverMedia = resolveMedia(product.coverImage, product.title || '')
  const galleryItems = await resolveGalleryItems(payload, product.images, product.title || '')
  const cartCoverImage = coverMedia?.url ?? galleryItems[0]?.media?.url ?? null
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
  const isOutOfStock = Math.max(
    0,
    (typeof product.stock === 'number' ? product.stock : 0) -
      (typeof product.allocatedStock === 'number' ? product.allocatedStock : 0),
  ) <= 0

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
      brand: resolveBrandLabel(product.brand, locale),
      isOutOfStock,
      isCurrent: true,
    },
    ...(Array.isArray(product.alternatives)
      ? product.alternatives.map((alt, index) => {
          const relatedId =
            typeof alt?.product === 'object' && alt.product && 'id' in alt.product
              ? String((alt.product as { id?: string | number }).id || '')
              : ''
          const altStock =
            typeof alt?.product === 'object' &&
            alt.product &&
            'stock' in alt.product &&
            typeof (alt.product as { stock?: unknown }).stock === 'number'
              ? ((alt.product as { stock?: number }).stock ?? 0)
              : null
          const altAllocated =
            typeof alt?.product === 'object' &&
            alt.product &&
            'allocatedStock' in alt.product &&
            typeof (alt.product as { allocatedStock?: unknown }).allocatedStock === 'number'
              ? ((alt.product as { allocatedStock?: number }).allocatedStock ?? 0)
              : 0

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
              locale,
            ),
            isOutOfStock: typeof altStock === 'number' ? Math.max(0, altStock - altAllocated) <= 0 : false,
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

  const toCarouselItem = (doc: typeof product): CarouselItem | null => {
    const title = doc.title || ''
    const media =
      resolveProductMedia(doc.coverImage, title) ||
      (Array.isArray(doc.images) ? resolveProductMedia(doc.images[0], title) : null) ||
      fallbackImage
    return createCarouselItem({
      id: doc.id,
      slug: doc.slug || undefined,
      title,
      subtitle: doc.description || undefined,
      price: formatPrice(locale, doc.price) || null,
      duration: null,
      image: { url: media.url, alt: media.alt },
      tag: resolveBrandLabel(doc.brand, locale),
      badgeLeft: null,
      badgeRight: null,
      href: doc.slug ? `/${locale}/shop/${doc.slug}` : undefined,
    })
  }

  const alternativeProductItems: CarouselItem[] = relatedDocs
    .map((doc) => toCarouselItem(doc))
    .filter((item): item is CarouselItem => Boolean(item))

  const productItems: CarouselItem[] = productsResult.docs
    .map((doc) => toCarouselItem(doc))
    .filter((item): item is CarouselItem => Boolean(item))

  const coverFallback =
    coverMedia ||
    (galleryItems.length
      ? { url: galleryItems[0].media.url, alt: galleryItems[0].media.alt }
      : null)

  const videoUpload = await resolveMediaFromId(payload, product.videoUpload)
  const videoMedia = videoUpload ? resolveMedia(videoUpload, product.title || '') : null
  const videoEmbed =
    typeof product.videoEmbedUrl === 'string' && product.videoEmbedUrl ? product.videoEmbedUrl : ''
  const videoPoster = await resolveMediaFromId(payload, product.videoPoster)
  const videoPosterMedia = videoPoster ? resolveMedia(videoPoster, product.title || '') : null

  const includedMediaDoc = await resolveMediaFromId(payload, product.includedMedia)
  const includedResolved = includedMediaDoc
    ? resolveMedia(includedMediaDoc, product.title || '')
    : null
  const includedDescriptionHtml = resolveRichTextHtml(product.includedDescription)
  const includedCtaLabel = resolveText(product.includedLabel, locale)
  const includedIngredientsLabel = resolveText(product.includedIngredientsLabel, locale)
  const includedFooter = resolveText(product.includedFooter, locale)
  const includedIngredientsItems = Array.isArray(product.includedIngredients)
    ? product.includedIngredients
        .map((item) => ({
          label: resolveText(item?.label, locale) || '',
          description: resolveText(item?.description, locale) || '',
        }))
        .filter((item) => item.label || item.description)
    : []

  const faqMediaDoc = await resolveMediaFromId(payload, product.faqMedia)
  const faqResolved = faqMediaDoc ? resolveMedia(faqMediaDoc, product.title || '') : null

  const descriptionText = resolveText(product.description, locale)
  const taglineText = resolveText(product.tagline, locale)
  const usageText = resolveText(product.usage, locale)
  const ingredientsText = resolveText(product.activeIngredients, locale)
  const resultsText = resolveText(product.results, locale)
  const specsGoodForText = resolveText(product.specsGoodFor, locale)
  const specsFeelsLikeText = resolveText(product.specsFeelsLike, locale)
  const specsSmellsLikeText = resolveText(product.specsSmellsLike, locale)
  const specsFYIText = resolveText(product.specsFYI, locale)
  const faqTitleText = resolveText(product.faqTitle, locale)
  const faqSubtitleText = resolveText(product.faqSubtitle, locale)
  const brandLineName =
    resolveText(brandLineDoc?.name, locale) ||
    resolveBrandLabel(product.brand, locale) ||
    copy.treatment.primaryTitleFallback
  const brandLineHeadlineText = resolveText(brandLineDoc?.lineHeadline, locale)
  const brandLineDescriptionText = resolveText(brandLineDoc?.description, locale)
  const brandLineUsageText = resolveText(brandLineDoc?.usage, locale)
  const brandLineIngredientsText = resolveText(brandLineDoc?.activeIngredients, locale)
  const brandLineResultsText = resolveText(brandLineDoc?.results, locale)
  const treatmentPrimaryTitle = resolveText(brandLineDoc?.name, locale) || ''
  const specsMediaDoc = await resolveMediaFromId(payload, product.specsMedia)
  const specsMediaResolved = specsMediaDoc ? resolveMedia(specsMediaDoc, product.title || '') : null
  const brandLineMediaDoc = await resolveMediaFromId(payload, brandLineDoc?.brandLineMedia)
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

  const brandBadgeLabel = resolveBrandLabel(product.brand, locale)
  const collectionBadgeLabel = resolveBadgeLabel(product.badge, locale)
  const leadBadgeLabel =
    product.badgeSource === 'collection'
      ? collectionBadgeLabel || brandBadgeLabel || 'DOB'
      : brandBadgeLabel || collectionBadgeLabel || 'DOB'
  const renderAccordionBody = (text: string) => {
    const bullets = normalizeBullets(text)
    if (bullets.length) {
      return (
        <ul>
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    }
    return <p>{text}</p>
  }

  return (
    <div className={`frontend-page ${styles.page}`}>
      <ProductAnalyticsTracker
        product={{
          id: String(product.id),
          title: product.title || t.shop.title,
          brand: resolveBrandLabel(product.brand, locale) || undefined,
          format: product.format || undefined,
          price: product.price ?? undefined,
          currency: 'EUR',
        }}
      />
      <SplitSection
        className={styles.leadSection}
        left={
          <UILeadGallery
            cover={coverMedia ? { url: coverMedia.url, alt: coverMedia.alt } : null}
            items={galleryItems.map((item) => ({
              media: item.media ? { url: item.media.url, alt: item.media.alt } : undefined,
              mediaType: item.mediaType,
            }))}
            mobilePeek
            showProgress
            classNames={{
              media: styles.heroMedia,
            }}
          />
        }
        right={
          <LeadPanel
            className={styles.heroPanel}
            stickyHeader
            header={
              <LeadHeader
                title={
                  <SectionTitle as="h1" size="h2" className={styles.title}>
                    {product.title}
                  </SectionTitle>
                }
                badge={leadBadgeLabel}
                description={taglineText || descriptionText || ''}
                titleRowClassName={styles.titleRow}
                badgeClassName={`${styles.badge} typo-caption-upper`}
                descriptionClassName={styles.description}
              />
            }
          >

            <AlternativeSelector
              options={formatOptions}
              baseProduct={{
                id: String(product.id),
                title: product.title || t.shop.title,
                slug: product.slug || undefined,
                price: product.price ?? undefined,
                currency: 'EUR',
                brand: resolveBrandLabel(product.brand, locale),
                format: product.format || undefined,
                coverImage: cartCoverImage,
                isOutOfStock,
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

            <DetailAccordion
              items={[
                ...(resultsText
                  ? [
                      {
                        id: 'benefits',
                        title: copy.accordion.benefits,
                        body: renderAccordionBody(resultsText),
                      },
                    ]
                  : []),
                ...(usageText
                  ? [
                      {
                        id: 'usage',
                        title: copy.accordion.usage,
                        body: renderAccordionBody(usageText),
                      },
                    ]
                  : []),
                ...(ingredientsText
                  ? [
                      {
                        id: 'ingredients',
                        title: copy.accordion.ingredients,
                        body: renderAccordionBody(ingredientsText),
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
            />
          </LeadPanel>
        }
      />

      <section className={styles.videoSection} aria-label={copy.aria.productVideo}>
        <div className={styles.videoWrap}>
          {videoMedia ? (
            <InlineVideo
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

      <DetailInsideSection
        ariaLabel={copy.aria.whatsInside}
        title={copy.whatsInside.title}
        mediaUrl={includedResolved?.url || coverFallback?.url || null}
        mediaAlt={includedResolved?.alt || coverFallback?.alt || product.title || t.shop.title}
        includedDescriptionHtml={includedDescriptionHtml}
        includedIngredientsLabel={includedIngredientsLabel}
        includedIngredientsItems={includedIngredientsItems}
        includedFooter={includedFooter}
        includedCtaLabel={includedCtaLabel}
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
          ingredientsLabel: styles.insideIngredientsLabel,
          ingredientsList: styles.insideIngredientsList,
          ingredientItem: styles.insideIngredientItem,
          ingredientTitle: styles.insideIngredientTitle,
          ingredientDescription: styles.insideIngredientDescription,
          footer: styles.insideFooter,
          cta: styles.insideCta,
          mediaCta: styles.insideMediaCta,
          ctaDesktop: styles.insideCtaDesktop,
          ctaMobile: styles.insideCtaMobile,
          closeButton: styles.insideCloseButton,
          includeLabel: styles.insideIncludeLabel,
        }}
      />

      <DetailFaqSection
        ariaLabel={copy.aria.faq}
        title={faqTitleText || copy.faq.titleFallback}
        subtitle={
          faqSubtitleText ||
          (product.title
            ? withProduct(copy.faq.subtitleWithProduct, t.placeholders.productName, product.title)
            : copy.faq.subtitleFallback)
        }
        items={
          Array.isArray(product.faqItems)
            ? product.faqItems
                .map((item) => {
                  const question = resolveText(item?.q, locale) || ''
                  if (!question) return null
                  const answer = resolveText(item?.a, locale) || ''
                  return {
                    question,
                    answerHtml: answer ? `<p>${escapeHtml(answer).replace(/\n/g, '<br />')}</p>` : '',
                  }
                })
                .filter(Boolean) as Array<{ question: string; answerHtml: string }>
            : []
        }
        fallbackItems={copy.faq.fallbackItems.map((item, index) => ({
          question: item.question,
          answerHtml:
            index === 0 && usageText
              ? `<p>${escapeHtml(usageText).replace(/\n/g, '<br />')}</p>`
              : `<p>${escapeHtml(item.answer).replace(/\n/g, '<br />')}</p>`,
        }))}
        media={
          faqResolved?.url || coverFallback?.url
            ? {
                url: faqResolved?.url || coverFallback?.url || '',
                alt: faqResolved?.alt || coverFallback?.alt || product.title || t.shop.title,
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

      <DetailTreatmentReveal
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
                <Carousel
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
        <Carousel
          items={productItems}
          ariaLabel={copy.treatment.shopCarouselAria}
          emptyLabel={copy.treatment.carouselEmpty}
        />
      </section>
    </div>
  )
}
