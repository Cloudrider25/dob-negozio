'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { NavigatorState, ProductCard } from '@/components/shop-navigator/types/navigator'
import type { ShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { ShopNavigatorHeader } from '@/components/shop-navigator/components/NavigatorHeader'
import { NavigatorGrid } from '@/components/shop-navigator/components/NavigatorGrid'
import { MobileFlow } from '@/components/shop-navigator/components/MobileFlow'
import { ShopNavigatorDataProvider } from '@/components/shop-navigator/data/shop-data-context'
import { UICCarouselCard } from '@/components/UIC_CarouselCard'
import type { ServicesCarouselItem } from '@/components/service-carousel/types'
import { emitCartUpdated, readCart, writeCart, type CartItem } from '@/lib/cartStorage'
import styles from './ShopNavigatorSection.module.css'

type ViewMode = 'navigator' | 'classic'

type ClassicParams = {
  query: string
  brand: string
  sort: string
  perPage: number
  page: number
  view: string
}

function ClassicShopView({
  products,
  params,
  productBasePath,
}: {
  products: ProductCard[]
  params: ClassicParams
  productBasePath: string
}) {
  const filtered = useMemo(() => {
    const query = params.query.toLowerCase()
    const brand = params.brand.toLowerCase()
    return products.filter((product) => {
      const matchesQuery = !query || product.title.toLowerCase().includes(query)
      const matchesBrand = !brand || (product.brand ?? '').toLowerCase().includes(brand)
      return matchesQuery && matchesBrand
    })
  }, [params.brand, params.query, products])

  const sorted = useMemo(() => {
    const items = [...filtered]
    if (params.sort === 'price-asc') {
      items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (params.sort === 'price-desc') {
      items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    } else {
      items.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    }
    return items
  }, [filtered, params.sort])

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / params.perPage))
  const page = Math.min(params.page, totalPages)
  const start = (page - 1) * params.perPage
  const pageItems = sorted.slice(start, start + params.perPage)

  return (
    <div className={styles.classicView}>
      <div className={styles.classicHeader}>
        <div>
          <h2 className={styles.classicTitle}>Shop Classico</h2>
          <p className={styles.classicSubtitle}>{total} prodotti disponibili</p>
        </div>
        <div className={styles.classicMeta}>
          Pagina {page} di {totalPages}
        </div>
      </div>

      <div
        className={params.view === 'list' ? styles.classicGridList : styles.classicGridCards}
      >
        {pageItems.map((product) => {
          const item: ServicesCarouselItem = {
            title: product.title,
            subtitle: product.description ?? undefined,
            price:
              typeof product.price === 'number'
                ? `${product.price.toFixed(2)} ${product.currency ?? 'EUR'}`
                : undefined,
            duration: null,
            image: {
              url: product.coverImage?.url ?? product.images?.[0]?.url ?? '',
              alt: product.coverImage?.alt ?? product.title,
            },
            tag: product.brand ?? null,
            badgeLeft: null,
            badgeRight: null,
            href: `${productBasePath}/${product.slug ?? product.id}`,
          }
          if (!item.image.url) return null
          return <UICCarouselCard key={product.id} item={item} />
        })}
      </div>
    </div>
  )
}

export function ShopNavigatorSection({
  data,
  initialClassicParams,
  productBasePath,
}: {
  data: ShopNavigatorData
  initialClassicParams: ClassicParams
  productBasePath: string
}) {
  const initialView =
    initialClassicParams.view === 'classic' || initialClassicParams.view === 'list'
      ? 'classic'
      : 'navigator'
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)
  const [state, setState] = useState<NavigatorState>({
    step: 'need',
  })

  const [showMobileFlow, setShowMobileFlow] = useState(false)

  const handleUpdateState = (updates: Partial<NavigatorState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const handleAddToCart = (product?: ProductCard) => {
    if (!product) return
    if (typeof window === 'undefined') return
    const items = readCart()
    const existing = items.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
      if (!existing.coverImage && product.coverImage?.url) {
        existing.coverImage = product.coverImage.url
      }
    } else {
      items.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        currency: product.currency,
        brand: product.brand,
        coverImage: product.coverImage?.url ?? null,
        quantity: 1,
      })
    }
    writeCart(items)
    emitCartUpdated()
  }

  return (
    <section className={`${styles.section} service-navigator`}>
      <ShopNavigatorDataProvider data={data}>
        <div className={styles.container}>
          <ShopNavigatorHeader activeView={viewMode} onViewChange={setViewMode} />

          <div className={styles.desktopOnly}>
            <AnimatePresence mode="wait">
              {viewMode === 'navigator' ? (
                <NavigatorGrid
                  key="navigator"
                  state={state}
                  onUpdateState={handleUpdateState}
                  onAddToCart={handleAddToCart}
                  productBasePath={productBasePath}
                />
              ) : (
                <ClassicShopView
                  key="classic"
                  products={data.products}
                  params={initialClassicParams}
                  productBasePath={productBasePath}
                />
              )}
            </AnimatePresence>
          </div>

          <div className={styles.mobileOnly}>
            {viewMode === 'classic' ? (
              <ClassicShopView
                products={data.products}
                params={initialClassicParams}
                productBasePath={productBasePath}
              />
            ) : (
              <button
                onClick={() => setShowMobileFlow(true)}
                className={styles.mobileCta}
              >
                Inizia la Configurazione
              </button>
            )}
          </div>
        </div>

        {showMobileFlow && (
          <MobileFlow
            state={state}
            onUpdateState={handleUpdateState}
            onClose={() => setShowMobileFlow(false)}
          />
        )}
      </ShopNavigatorDataProvider>
    </section>
  )
}
