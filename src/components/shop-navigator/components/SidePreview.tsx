'use client'

import { useEffect, useMemo, useState } from 'react'
import type { NavigatorState } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { Minus, Plus, ShoppingBag, Trash } from '@/components/shop-navigator/icons'

interface SidePreviewProps {
  state: NavigatorState
}

export function SidePreview({ state }: SidePreviewProps) {
  const {
    getNeedById,
    getCategoryById,
    getRoutineStepById,
    getLineById,
    getTextureById,
    getProductsForFilters,
  } = useShopNavigatorData()

  const filters = {
    needId: state.selectedNeed,
    categoryId: state.selectedCategory,
    routineStepId: state.selectedRoutineStep,
    lineId: state.selectedLine,
    textureId: state.selectedTexture,
  }

  const resultCount = getProductsForFilters(filters).length

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
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const cartTotals = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    )
    return { totalItems, totalPrice }
  }, [cartItems])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadCart = () => {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY)
      const items = raw ? (JSON.parse(raw) as CartItem[]) : []
      setCartItems(items)
    }

    loadCart()
    const handler = () => loadCart()
    window.addEventListener('dob:cart-updated', handler)
    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('dob:cart-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const handleRemoveFromCart = (id: string) => {
    if (typeof window === 'undefined') return
    const next = cartItems.filter((item) => item.id !== id)
    setCartItems(next)
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('dob:cart-updated'))
  }

  const handleIncrement = (id: string) => {
    if (typeof window === 'undefined') return
    const next = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    )
    setCartItems(next)
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('dob:cart-updated'))
  }

  const handleDecrement = (id: string) => {
    if (typeof window === 'undefined') return
    const next = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0)
    setCartItems(next)
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('dob:cart-updated'))
  }

  return (
    <div className="navigator-column">
      {cartItems.length > 0 && (
        <div className="mb-6 navigator-column">
          <div className="mb-1">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Carrello
            </h3>
          </div>
          <div className="relative w-full">
            <div className="navigator-box p-6 rounded-lg backdrop-blur-sm h-full">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-4 h-4 text-accent-cyan" />
                <h3 className="text-sm font-medium text-accent-cyan uppercase tracking-wider">
                  Prodotti Selezionati ({cartTotals.totalItems})
                </h3>
              </div>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="navigator-box p-3 rounded-lg group hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary font-medium mb-1 truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-text-muted space-y-0.5">
                          {item.brand && <div>{item.brand}</div>}
                          <div className="flex items-center gap-3 mt-1">
                            <span>Qty {item.quantity}</span>
                            {typeof item.price === 'number' && (
                              <span>
                                {item.currency ?? '€'} {item.price * item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {item.quantity > 1 ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDecrement(item.id)}
                            className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-accent-red" />
                          </button>
                          <span className="text-xs text-text-muted tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item.id)}
                            className="p-1 rounded hover:bg-cyan-500/20 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-accent-cyan" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                        >
                          <Trash className="w-4 h-4 text-accent-red" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-cyan-500/20 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Totale prodotti</span>
                  <span className="text-accent-cyan font-medium">{cartTotals.totalItems}</span>
                </div>
                {cartTotals.totalPrice > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Totale</span>
                    <span className="text-accent-cyan font-medium">
                      € {cartTotals.totalPrice}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 navigator-column">
        <div className="mb-1">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Riepilogo
          </h3>
        </div>

        <div className="relative w-full">
          <div className="navigator-box p-6 rounded-lg backdrop-blur-sm h-full">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-text-muted mb-1">Esigenza</div>
                <div className="text-base text-text-primary">
                  {state.selectedNeed ? getNeedById(state.selectedNeed)?.label || '—' : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Categoria</div>
                <div className="text-base text-text-primary capitalize">
                  {state.selectedCategory
                    ? getCategoryById(state.selectedCategory)?.label || '—'
                    : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Routine</div>
                <div className="text-base text-text-primary capitalize">
                  {state.selectedRoutineStep
                    ? getRoutineStepById(state.selectedRoutineStep)?.label || '—'
                    : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Linea</div>
                <div className="text-base text-text-primary capitalize">
                  {state.selectedLine ? getLineById(state.selectedLine)?.label || '—' : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Texture</div>
                <div className="text-base text-text-primary capitalize">
                  {state.selectedTexture
                    ? getTextureById(state.selectedTexture)?.label || '—'
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="navigator-column">
        <div className="mb-1">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Risultati
          </h3>
        </div>
        <div className="relative w-full">
          <div className="navigator-box p-6 rounded-lg backdrop-blur-sm h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">
                Prodotti
              </div>
              <div className="text-3xl font-semibold text-text-primary">{resultCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
