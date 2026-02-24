'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import styles from './CartDrawer.module.css'
import { Trash } from '@/components/ui/icons'
import { SideDrawer } from '@/components/ui/SideDrawer'
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

const isServiceCartItem = (item: CartItem) =>
  item.id.includes(':service:') || item.id.includes(':package:')

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
  const productSubtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => (isServiceCartItem(item) ? sum : sum + (item.price ?? 0) * item.quantity),
        0,
      ),
    [items],
  )
  const hasProducts = useMemo(() => items.some((item) => !isServiceCartItem(item)), [items])
  const hasServices = useMemo(() => items.some((item) => isServiceCartItem(item)), [items])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )
  const freeShippingUnlocked = isFreeShippingUnlocked(productSubtotal)
  const remainingForFreeShipping = getRemainingForFreeShipping(productSubtotal)
  const freeShippingProgress = Math.min(
    100,
    Math.max(0, (productSubtotal / FREE_SHIPPING_THRESHOLD_EUR) * 100),
  )
  const remainingLabel = formatPrice(remainingForFreeShipping)
  const pickupSuffix = hasProducts && hasServices ? ' oppure ritira in negozio' : ''
  const freeShippingNote = freeShippingUnlocked
    ? `${copy.freeShippingUnlocked}${pickupSuffix}`
    : resolvedLocale === 'it'
      ? `Ti mancano ${remainingLabel} per la spedizione gratuita${pickupSuffix}`
      : resolvedLocale === 'ru'
        ? `Добавьте товаров на ${remainingLabel} для бесплатной доставки${pickupSuffix}`
        : `${remainingLabel} away from free shipping${pickupSuffix}`
  const showShippingProgress = hasProducts

  return (
    <SideDrawer
      open={open}
      onClose={() => setOpen(false)}
      ariaLabel="Cart drawer"
      title={
        <>
          {itemCount} {copy.itemsLabel}
        </>
      }
    >
        {showShippingProgress ? (
          <>
            <div className={styles.progress}>
              <div className={styles.progressFill} style={{ width: `${freeShippingProgress}%` }} />
            </div>
            <div className={`${styles.freeNote} typo-caption-upper`}>{freeShippingNote}</div>
          </>
        ) : null}

        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={`${styles.empty} typo-body`}>{copy.cartEmpty}</div>
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
                  <h2 className={`${styles.itemTitle} typo-small-upper`}>{item.title}</h2>
                  {item.brand && <div className={`${styles.itemMeta} typo-caption`}>{item.brand}</div>}
                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={`${styles.qtyButton} typo-body`}
                      onClick={() => decrement(item.id)}
                      aria-label={copy.decreaseQuantityAria}
                    >
                      −
                    </button>
                    <span className={`${styles.qtyValue} typo-caption`}>{item.quantity}</span>
                    <button
                      type="button"
                      className={`${styles.qtyButton} typo-body`}
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
                    <Trash className={styles.removeIcon} size={24} />
                  </button>
                </div>
                <div className={`${styles.price} typo-small`}>
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
            <p className={`${styles.routineTitle} typo-caption-upper`}>{recommended?.title || copy.completeRoutine}</p>
            <div className={`${styles.itemMeta} typo-caption`}>
              {recommended?.format || copy.recommendedSelection}
            </div>
          </div>
          <button className={`${styles.routineButton} typo-caption-upper`} type="button" onClick={addRecommendedToCart}>
            {copy.add}
          </button>
        </div>

        <div className={styles.summary}>
          <div className={`${styles.summaryRow} typo-small`}>
            <span>{copy.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={`${styles.itemMeta} typo-caption`}>{copy.summaryNote}</div>
          <Link
            className={`${styles.checkoutButton} typo-caption-upper`}
            href={`/${locale}/checkout`}
            onClick={() => setOpen(false)}
          >
            {copy.checkout}
          </Link>
        </div>
    </SideDrawer>
  )
}
