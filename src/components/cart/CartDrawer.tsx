'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import styles from './CartDrawer.module.css'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import {
  FREE_SHIPPING_THRESHOLD_EUR,
  getRemainingForFreeShipping,
  isFreeShippingUnlocked,
} from '@/lib/shop/shipping'
import {
  CART_OPEN_EVENT,
  CART_UPDATED_EVENT,
  readCart,
  writeCart,
  type CartItem,
  emitCartUpdated,
} from '@/lib/cartStorage'

const formatPrice = (value: number, currency?: string) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

type RecommendedProduct = {
  id: string
  title: string
  price: number | null
  currency: string
  format: string
  coverImage: string | null
  lineName: string
  brandName: string
}

export function CartDrawer({ locale, initialOpen = false }: { locale: string; initialOpen?: boolean }) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).cartDrawer
  const [items, setItems] = useState<CartItem[]>([])
  const [recommended, setRecommended] = useState<RecommendedProduct | null>(null)
  const [open, setOpen] = useState(initialOpen)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const load = () => {
      setItems(readCart())
    }
    const openDrawer = () => {
      load()
      setOpen(true)
    }
    load()
    window.addEventListener(CART_UPDATED_EVENT, load)
    window.addEventListener('storage', load)
    window.addEventListener(CART_OPEN_EVENT, openDrawer)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, load)
      window.removeEventListener('storage', load)
      window.removeEventListener(CART_OPEN_EVENT, openDrawer)
    }
  }, [])

  useEffect(() => {
    if (initialOpen) {
      setOpen(true)
    }
  }, [initialOpen])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  useEffect(() => {
    if (items.length === 0) {
      setRecommended(null)
      return
    }

    const seedId = Number(items[0]?.id)
    if (!Number.isFinite(seedId)) {
      setRecommended(null)
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      productId: String(seedId),
      locale: resolvedLocale,
      limit: '1',
      exclude: items.map((item) => item.id).join(','),
    })

    const run = async () => {
      try {
        const response = await fetch(`/api/shop/recommendations?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as { ok?: boolean; docs?: RecommendedProduct[] }
        if (!response.ok || !data.ok || !Array.isArray(data.docs) || data.docs.length === 0) {
          setRecommended(null)
          return
        }
        setRecommended(data.docs[0] || null)
      } catch {
        if (!controller.signal.aborted) setRecommended(null)
      }
    }

    void run()
    return () => controller.abort()
  }, [items, resolvedLocale])

  const updateItems = (next: CartItem[]) => {
    setItems(next)
    if (typeof window !== 'undefined') {
      writeCart(next)
      emitCartUpdated()
    }
  }

  const increment = (id: string) => {
    updateItems(items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)))
  }

  const decrement = (id: string) => {
    updateItems(
      items
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id))
  }

  const addRecommendedToCart = () => {
    if (!recommended) return
    const next = [...items]
    const existingIndex = next.findIndex((item) => item.id === recommended.id)
    if (existingIndex >= 0) {
      const existing = next[existingIndex]
      next[existingIndex] = {
        ...existing,
        quantity: existing.quantity + 1,
      }
    } else {
      next.push({
        id: recommended.id,
        title: recommended.title,
        price: typeof recommended.price === 'number' ? recommended.price : undefined,
        currency: recommended.currency || 'EUR',
        brand: recommended.brandName || recommended.lineName || undefined,
        coverImage: normalizeThumbnailSrc(recommended.coverImage),
        quantity: 1,
      })
    }
    updateItems(next)
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [items],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )
  const freeShippingUnlocked = isFreeShippingUnlocked(subtotal)
  const remainingForFreeShipping = getRemainingForFreeShipping(subtotal)
  const freeShippingProgress = Math.min(
    100,
    Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD_EUR) * 100),
  )
  const remainingLabel = formatPrice(remainingForFreeShipping)
  const freeShippingNote = freeShippingUnlocked
    ? copy.freeShippingUnlocked
    : resolvedLocale === 'it'
      ? `Ti mancano ${remainingLabel} per la spedizione gratuita`
      : resolvedLocale === 'ru'
        ? `Добавьте товаров на ${remainingLabel} для бесплатной доставки`
        : `${remainingLabel} away from free shipping`

  return (
    <div className={`${styles.drawerRoot} ${open ? styles.open : ''}`}>
      <div
        className={styles.backdrop}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
      <aside className={styles.panel} aria-label="Cart drawer">
        <div className={styles.header}>
          <span>
            {itemCount} {copy.itemsLabel}
          </span>
          <button className={styles.closeButton} type="button" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ width: `${freeShippingProgress}%` }} />
        </div>
        <div className={styles.freeNote}>{freeShippingNote}</div>

        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>{copy.cartEmpty}</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.thumb}>
                  {normalizeThumbnailSrc(item.coverImage) ? (
                    <Image
                      src={normalizeThumbnailSrc(item.coverImage) || ''}
                      alt={item.title}
                      fill
                      className="object-contain"
                      unoptimized={isRemoteThumbnailSrc(item.coverImage)}
                      sizes="144px"
                    />
                  ) : null}
                </div>
                <div>
                  <h2 className={styles.itemTitle}>{item.title}</h2>
                  {item.brand && <div className={styles.itemMeta}>{item.brand}</div>}
                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={styles.qtyButton}
                      onClick={() => decrement(item.id)}
                      aria-label={copy.decreaseQuantityAria}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyButton}
                      onClick={() => increment(item.id)}
                      aria-label={copy.increaseQuantityAria}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    aria-label={copy.remove}
                  >
                    <Image
                      src="/bin.png"
                      alt=""
                      width={16}
                      height={16}
                      className={styles.removeIcon}
                    />
                  </button>
                </div>
                <div className={styles.price}>
                  {typeof item.price === 'number'
                    ? formatPrice(item.price * item.quantity, item.currency)
                    : '—'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.routine}>
          <div className={styles.routineThumb}>
            {normalizeThumbnailSrc(recommended?.coverImage) ? (
              <Image
                src={normalizeThumbnailSrc(recommended?.coverImage) || ''}
                alt={recommended?.title || copy.completeRoutine}
                fill
                className="object-contain"
                unoptimized={isRemoteThumbnailSrc(recommended?.coverImage)}
                sizes="52px"
              />
            ) : null}
          </div>
          <div className={styles.routineInfo}>
            <p className={styles.routineTitle}>{recommended?.title || copy.completeRoutine}</p>
            <div className={styles.itemMeta}>
              {recommended?.format || copy.recommendedSelection}
            </div>
          </div>
          <button className={styles.routineButton} type="button" onClick={addRecommendedToCart}>
            {copy.add}
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>{copy.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={styles.itemMeta}>{copy.summaryNote}</div>
          <Link
            className={styles.checkoutButton}
            href={`/${locale}/checkout`}
            onClick={() => setOpen(false)}
          >
            {copy.checkout}
          </Link>
        </div>
      </aside>
    </div>
  )
}
