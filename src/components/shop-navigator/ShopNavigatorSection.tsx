'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { NavigatorState, ProductCard } from '@/components/shop-navigator/types/navigator'
import type { ShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { ShopNavigatorHeader } from '@/components/shop-navigator/components/NavigatorHeader'
import { NavigatorGrid } from '@/components/shop-navigator/components/NavigatorGrid'
import { MobileFlow } from '@/components/shop-navigator/components/MobileFlow'
import { ShopNavigatorDataProvider } from '@/components/shop-navigator/data/shop-data-context'
import { ShopProductCard } from '@/components/shop-navigator/components/columns/ColumnProducts'

type ViewMode = 'navigator' | 'classic'

type ClassicParams = {
  query: string
  brand: string
  sort: string
  perPage: number
  page: number
  view: string
}

type CartItem = {
  id: string
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: string | null
  quantity: number
}

const CART_STORAGE_KEY = 'dob:cart'

function ClassicShopView({
  products,
  params,
  onAddToCart,
  productBasePath,
}: {
  products: ProductCard[]
  params: ClassicParams
  onAddToCart: (product: ProductCard) => void
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-text-primary">Shop Classico</h2>
          <p className="text-sm text-text-muted">
            {total} prodotti disponibili
          </p>
        </div>
        <div className="text-sm text-text-muted">
          Pagina {page} di {totalPages}
        </div>
      </div>

      <div
        className={
          params.view === 'list'
            ? 'grid grid-cols-1 gap-4'
            : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {pageItems.map((product) => (
          <ShopProductCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart(product)}
            href={`${productBasePath}/${product.slug ?? product.id}`}
          />
        ))}
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
  const [viewMode, setViewMode] = useState<ViewMode>('navigator')
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
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    const items: CartItem[] = raw ? (JSON.parse(raw) as CartItem[]) : []
    const existing = items.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
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
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('dob:cart-updated'))
  }

  return (
    <section className="service-navigator relative min-h-screen overflow-hidden bg-bg-2">
      <ShopNavigatorDataProvider data={data}>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <ShopNavigatorHeader activeView={viewMode} onViewChange={setViewMode} />

          <div className="hidden lg:block">
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
                  onAddToCart={handleAddToCart}
                  productBasePath={productBasePath}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="lg:hidden">
            {viewMode === 'classic' ? (
              <ClassicShopView
                products={data.products}
                params={initialClassicParams}
                onAddToCart={handleAddToCart}
                productBasePath={productBasePath}
              />
            ) : (
              <button
                onClick={() => setShowMobileFlow(true)}
                className="w-full px-6 py-4 rounded-lg bg-accent-cyan text-text-inverse font-medium shadow-soft transition-all duration-300"
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
