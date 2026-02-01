import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'
import styles from './product-detail.module.css'
import { HeroGallery } from './HeroGallery'

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
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{product.title}</h1>
            <span className={styles.badge}>{product.brand || 'DOB'}</span>
          </div>

          {product.description && <p className={styles.description}>{product.description}</p>}

          <div className={styles.divider} />

          <div className={styles.metaRow}>
            <span>{product.sku ? `SKU ${product.sku}` : t.shop.title}</span>
            <span className={styles.price}>{formatPrice(product.price, product.currency)}</span>
          </div>

          <div className={styles.relatedBlock}>
            <div className={styles.label}>Dettagli prodotto</div>
            <div className={styles.relatedList}>
              {product.usage ? <p>{product.usage}</p> : null}
              {product.activeIngredients ? <p>{product.activeIngredients}</p> : null}
              {product.results ? <p>{product.results}</p> : null}
            </div>
            <Link className={styles.buyButton} href={`/${locale}/shop`}>
              Torna allo shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
