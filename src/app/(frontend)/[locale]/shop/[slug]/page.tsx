import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { SerializedEditorState } from 'lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'
import styles from './product-detail.module.css'
import { HeroGallery } from './HeroGallery'
import { AlternativeSelector } from './AlternativeSelector'
import { ServiceAccordion } from '@/app/(frontend)/[locale]/services/service/[slug]/ServiceAccordion'
import { FaqAccordion } from '@/app/(frontend)/[locale]/services/service/[slug]/FaqAccordion'
import { ServiceTreatmentReveal } from '@/components/ServiceTreatmentReveal'
import { ServicesCarousel, type ServicesCarouselItem } from '@/components/ServicesCarousel'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

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
      coverImage: coverMedia?.url ?? null,
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
              : null) || product.slug || '',
          title:
            (typeof alt?.product === 'object' && alt.product && 'title' in alt.product
              ? (alt.product as { title?: string | null }).title
              : null) || product.title || t.shop.title,
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
                ? (alt.product as { price?: number | null }).price ?? null
                : null,
          currency: 'EUR',
          coverImage:
            typeof alt?.product === 'object' && alt.product && 'coverImage' in alt.product
              ? resolveProductMedia(
                  (alt.product as { coverImage?: unknown }).coverImage,
                  (alt.product as { title?: string | null }).title || product.title || '',
                )?.url || null
              : null,
          brand:
            resolveBrandLabel(
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
    : { url: '/media/493b3205c13b5f67b36cf794c2222583.jpg', alt: t.shop.title }

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
  const includedContent = renderRichText(product.includedDescription)

  const faqMediaDoc = await resolveMediaFromId(product.faqMedia)
  const faqResolved = faqMediaDoc ? resolveMedia(faqMediaDoc, product.title || '') : null

  const lineMediaDoc = await resolveMediaFromId(product.lineMedia)
  const lineMediaResolved = lineMediaDoc ? resolveMedia(lineMediaDoc, product.title || '') : null

  const descriptionText = resolveText(product.description)
  const usageText = resolveText(product.usage)
  const ingredientsText = resolveText(product.activeIngredients)
  const resultsText = resolveText(product.results)
  const lineHeadlineText = resolveText(product.lineHeadline)
  const faqTitleText = resolveText(product.faqTitle)
  const faqSubtitleText = resolveText(product.faqSubtitle)

  const lineHeadline = lineHeadlineText || 'Formula clinicamente testata.'

  const lineDetails = [
    {
      label: 'Good for',
      value: resultsText || 'Pelli normali e secche',
    },
    {
      label: 'Feels like',
      value: descriptionText || 'Texture morbida e avvolgente che si fonde sulla pelle.',
    },
    {
      label: 'Smells like',
      value: 'Senza profumo',
    },
    {
      label: 'Award',
      value: usageText || 'Dermatologicamente testato.',
    },
    {
      label: 'FYI',
      value: ingredientsText || 'Cruelty-free • Vegan • Gluten-free',
    },
  ]

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <HeroGallery
          cover={coverMedia ? { url: coverMedia.url, alt: coverMedia.alt } : null}
          items={galleryItems.map((item) => ({
            media: item.media ? { url: item.media.url, alt: item.media.alt } : undefined,
            mediaType: item.mediaType,
          }))}
        />

        <div className={styles.heroPanel}>
          <div className={styles.heroHeader}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{product.title}</h1>
              <span className={styles.badge}>{resolveBrandLabel(product.brand) || 'DOB'}</span>
            </div>

            <p className={styles.description}>{descriptionText || ''}</p>
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
              coverImage: coverMedia?.url ?? null,
            }}
            locale={locale}
            fallbackLabel={product.title || t.shop.title}
            className={styles.buyButton}
          />

          <div className={styles.divider} />

          {addOnProduct ? (
            <div className={styles.crossSell}>
              <div className={styles.crossSellTitle}>Aggiungi</div>
              <div className={styles.crossSellRow}>
                <div className={styles.crossSellItem}>
                  <div className={styles.crossSellThumb}>
                    <Image
                      src={
                        resolveProductMedia(addOnProduct.coverImage, addOnProduct.title || '')
                          ?.url || fallbackImage.url
                      }
                      alt={addOnProduct.title || 'Prodotto'}
                      fill
                    />
                  </div>
                  <div>
                    <div className={styles.crossSellName}>{addOnProduct.title || 'Prodotto'}</div>
                    <div className={styles.crossSellMeta}>Selezione consigliata</div>
                  </div>
                </div>
                <Link
                  className={styles.lineupButton}
                  href={
                    addOnProduct.slug ? `/${locale}/shop/${addOnProduct.slug}` : `/${locale}/shop`
                  }
                >
                  Scopri
                </Link>
              </div>
            </div>
          ) : null}

          <ServiceAccordion
            items={[
              ...(resultsText
                ? [
                    {
                      id: 'benefits',
                      title: 'Benefici',
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
                      title: "Modo d'uso",
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
                      title: 'Principi attivi',
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
      </section>

      <section className={styles.videoSection} aria-label="Product video">
        <div className={styles.videoWrap}>
          {videoMedia ? (
            <video className={styles.video} src={videoMedia.url} controls playsInline />
          ) : videoEmbed ? (
            <iframe
              className={styles.video}
              src={videoEmbed}
              title="Product video"
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
                />
              )}
              <div className={styles.videoOverlay}>Video placeholder</div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.lineSection} aria-label="Linea prodotto">
        <div className={styles.lineGrid}>
          <div className={styles.lineCopy}>
            <h2 className={styles.lineTitle}>
              {lineHeadline.split(' ').map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={index > 1 && index < 4 ? styles.lineTitleAccent : undefined}
                >
                  {word}
                </span>
              ))}
            </h2>
            <div className={styles.lineDetails}>
              {(Array.isArray(product.lineDetails) && product.lineDetails.length
                ? product.lineDetails.map((item) => ({
                    label: resolveText(item?.label) || '',
                    value: resolveText(item?.value) || '',
                  }))
                : lineDetails
              ).map((item) => (
                <div key={item.label} className={styles.lineRow}>
                  <span className={styles.lineLabel}>{item.label}</span>
                  <span className={styles.lineValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.lineMedia}>
            {lineMediaResolved?.url || coverFallback?.url ? (
              <Image
                src={lineMediaResolved?.url || coverFallback?.url || ''}
                alt={lineMediaResolved?.alt || coverFallback?.alt || product.title || t.shop.title}
                fill
                className={styles.lineImage}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className={styles.linePlaceholder} />
            )}
          </div>
        </div>
      </section>

      <section className={styles.insideSection} aria-label="Cosa contiene">
        <div className={styles.insideGrid}>
          <div className={styles.insideMedia}>
            {includedResolved?.url || coverFallback?.url ? (
              <Image
                src={includedResolved?.url || coverFallback?.url || ''}
                alt={includedResolved?.alt || coverFallback?.alt || product.title || t.shop.title}
                fill
                className={styles.insideImage}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className={styles.insidePlaceholder} />
            )}
          </div>
          <div className={styles.insideContent}>
            <div className={styles.insideLabel}>what&apos;s inside</div>
            {includedContent ? (
              includedContent.type === 'html' ? (
                <div
                  className={styles.insideRich}
                  dangerouslySetInnerHTML={{ __html: includedContent.value }}
                />
              ) : (
                <p className={styles.insideLead}>{includedContent.value}</p>
              )
            ) : ingredientsText ? (
              <p className={styles.insideLead}>{ingredientsText}</p>
            ) : descriptionText ? (
              <p className={styles.insideLead}>{descriptionText}</p>
            ) : (
              <p className={styles.insideLead}>
                {product.title ? `Scopri cosa rende speciale ${product.title}.` : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.faqSection} aria-label="FAQ">
        <div className={styles.faqGrid}>
          <div className={styles.faqCopy}>
            <h2 className={styles.faqTitle}>{faqTitleText || 'FAQ'}</h2>
            <p className={styles.faqSubtitle}>
              {faqSubtitleText ||
                (product.title
                  ? `Scopri di più su ${product.title}.`
                  : 'Scopri di più su questo prodotto.')}
            </p>
            <div className={styles.faqList}>
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
                          answerHtml: answer ? `<p>${escapeHtml(answer)}</p>` : '',
                        }
                      })
                      .filter(Boolean) as Array<{ question: string; answerHtml: string }>
                  }
                />
              ) : (
                <FaqAccordion
                  items={[
                    {
                      question: 'Come si applica?',
                      answerHtml: `<p>${escapeHtml(
                        usageText || 'Usa il prodotto come indicato nella routine consigliata.',
                      )}</p>`,
                    },
                    {
                      question: 'Per che tipo di pelle è indicato?',
                      answerHtml:
                        '<p>Adatto a più tipi di pelle. Se hai dubbi chiedi una consulenza.</p>',
                    },
                    {
                      question: 'Ogni quanto si usa?',
                      answerHtml:
                        '<p>Consigliato 1-2 volte al giorno in base alle esigenze personali.</p>',
                    },
                  ]}
                />
              )}
            </div>
          </div>
          <div className={styles.faqMedia}>
            {faqResolved?.url || coverFallback?.url ? (
              <Image
                src={faqResolved?.url || coverFallback?.url || ''}
                alt={faqResolved?.alt || coverFallback?.alt || product.title || t.shop.title}
                fill
                className={styles.faqImage}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className={styles.faqPlaceholder} />
            )}
          </div>
        </div>
      </section>

      <ServiceTreatmentReveal
        primary={{
          title: product.title || 'Protocol overview',
          mediaDescription: descriptionText || '',
          body: <p className={styles.treatmentText}>{resultsText || ''}</p>,
          imageUrl: coverFallback?.url || fallbackImage.url,
          imageAlt: coverFallback?.alt || product.title || undefined,
          rail: ['Click here', 'Prodotti alternativi'],
          href: product.slug ? `/${locale}/shop/${product.slug}` : undefined,
        }}
        secondary={{
          title: 'Prodotti alternativi',
          body: null,
          rail: ['Click here', 'Prodotti alternativi'],
          href: undefined,
          mediaBody: (
            <div className={styles.treatmentCarousel}>
              {alternativeProductItems.length > 0 ? (
                <ServicesCarousel
                  items={alternativeProductItems}
                  single
                  cardClassName={styles.altCarouselCard}
                  mediaClassName={styles.altCarouselMedia}
                />
              ) : (
                <p className={styles.treatmentText}>
                  Il prodotto scelto è unico nel suo genere e non ha alternative.
                </p>
              )}
            </div>
          ),
        }}
      />

      <section aria-label="Altri prodotti">
        <ServicesCarousel items={productItems} />
      </section>
    </div>
  )
}
