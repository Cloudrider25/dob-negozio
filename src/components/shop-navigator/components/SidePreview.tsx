'use client'

import { useEffect, useMemo, useState } from 'react'
import type { NavigatorState } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { Minus, Plus, ShoppingBag, Trash } from '@/components/shop-navigator/icons'
import styles from './SidePreview.module.css'
import shared from './columns/columns-shared.module.css'

interface SidePreviewProps {
  state: NavigatorState
}

export function SidePreview({ state }: SidePreviewProps) {
  const {
    getNeedById,
    getTextureById,
    getProductsForFilters,
  } = useShopNavigatorData()

  const filters = {
    needId: state.selectedNeed,
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
    <div className={styles.column}>
      {cartItems.length > 0 && (
        <div className={styles.section}>
          <div className={styles.heading}>
            <h3 className={styles.headingText}>Carrello</h3>
          </div>
          <div className={styles.panel}>
            <div className={`${styles.panelCard} ${shared.box}`}>
              <div className={styles.cartHeader}>
                <ShoppingBag className={styles.cartHeaderIcon} />
                <h3 className={styles.cartHeaderText}>
                  Prodotti Selezionati ({cartTotals.totalItems})
                </h3>
              </div>

              <div className={styles.cartList}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.cartItem} ${shared.box}`}
                  >
                    <div className={styles.cartItemRow}>
                      <div className={`${styles.cartMetaStack} ${styles.cartText}`}>
                        <div className={styles.cartItemTitle}>{item.title}</div>
                        <div className={styles.cartMeta}>
                          {item.brand && <div>{item.brand}</div>}
                          <div className={styles.cartMetaRow}>
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
                        <div className={styles.cartControls}>
                          <button
                            onClick={() => handleDecrement(item.id)}
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          >
                            <Minus className={`${styles.iconSmall} ${styles.iconDanger}`} />
                          </button>
                          <span className={styles.qtyText}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item.id)}
                            className={`${styles.iconButton} ${styles.iconButtonAccent}`}
                          >
                            <Plus className={`${styles.iconSmall} ${styles.iconAccent}`} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                        >
                          <Trash className={`${styles.iconSmall} ${styles.iconDanger}`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cartTotals}>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Totale prodotti</span>
                  <span className={styles.totalValue}>{cartTotals.totalItems}</span>
                </div>
                {cartTotals.totalPrice > 0 && (
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Totale</span>
                    <span className={styles.totalValue}>
                      € {cartTotals.totalPrice}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.heading}>
          <h3 className={styles.headingText}>Riepilogo</h3>
        </div>

        <div className={styles.panel}>
          <div className={`${styles.panelCard} ${shared.box}`}>
            <div className={styles.summaryList}>
              <div>
                <div className={styles.summaryLabel}>Esigenza</div>
                <div className={styles.summaryValue}>
                  {state.selectedNeed ? getNeedById(state.selectedNeed)?.label || '—' : '—'}
                </div>
              </div>

              <div>
                <div className={styles.summaryLabel}>Texture</div>
                <div className={styles.summaryValue}>
                  {state.selectedTexture
                    ? getTextureById(state.selectedTexture)?.label || '—'
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.column}>
        <div className={styles.heading}>
          <h3 className={styles.headingText}>Risultati</h3>
        </div>
        <div className={styles.panel}>
          <div className={`${styles.panelCard} ${styles.resultCard} ${shared.box}`}>
            <div className={styles.resultCenter}>
              <div className={styles.resultLabel}>Prodotti</div>
              <div className={styles.resultValue}>{resultCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
