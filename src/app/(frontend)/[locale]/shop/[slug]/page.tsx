import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { ProductPurchase } from '@/components/shop/ProductPurchase'
import { ProductTabs } from '@/components/shop/ProductTabs'

type PageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      or: [{ slug: { equals: slug } }, { id: { equals: slug } }],
    },
  })

  const product = result.docs[0]
  if (!product) notFound()

  const t = getDictionary(locale)

  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || product.title || '' }
  }

  const cover = resolveMedia(product.coverImage)
  const gallery = Array.isArray(product.images)
    ? product.images.map(resolveMedia).filter(Boolean)
    : []
  const mainImage = cover ?? gallery[0] ?? null
  const isRemote = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url))

  return (
    <div className="min-h-screen flex flex-col gap-[var(--s32)] px-[8vw] pb-16">
      <section className="grid grid-cols-[1fr_auto_1fr] items-center pt-4 max-[1100px]:grid-cols-1 max-[1100px]:gap-4 max-[1100px]:text-center">
        <div className="flex gap-2 text-[0.8rem] uppercase tracking-[0.2em] max-[1100px]:justify-center">
          <span>Home</span>
          <span>/</span>
          <span>{t.shop.title}</span>
        </div>
        <div className="text-center">
          <h1 className="text-[2.2rem]">{product.title}</h1>
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)] gap-8 max-[1200px]:grid-cols-1">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-paper">
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.title}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 40vw"
                unoptimized={isRemote(mainImage.url)}
              />
            ) : (
              <div className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--paper)_60%,transparent)]" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {gallery.slice(0, 5).map((image, index) =>
                image ? (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-paper">
                    <Image
                      src={image.url}
                      alt={image.alt || product.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1200px) 20vw, 6vw"
                      unoptimized={isRemote(image.url)}
                    />
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand && (
              <div className="text-sm uppercase tracking-[0.2em] text-text-muted">
                {product.brand}
              </div>
            )}
            <h2 className="text-2xl font-semibold text-text-primary">{product.title}</h2>
            {product.description && (
              <p className="text-sm text-text-secondary">{product.description}</p>
            )}
          </div>

          <ProductPurchase
            product={{
              id: String(product.id),
              title: product.title || '',
              slug: product.slug || undefined,
              price: typeof product.price === 'number' ? product.price : undefined,
              currency: product.currency || undefined,
              brand: product.brand || undefined,
              coverImage: cover?.url ?? null,
            }}
          />
        </div>

        <div>
          <ProductTabs
            description={product.description || null}
            usage={product.usage || null}
            activeIngredients={product.activeIngredients || null}
            results={product.results || null}
          />
        </div>
      </section>
    </div>
  )
}
