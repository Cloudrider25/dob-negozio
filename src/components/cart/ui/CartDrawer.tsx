'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { MediaThumb } from '@/components/shared/MediaThumb'
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
} from '@/lib/cartStorage'
import { useCartState } from '../hooks/useCartState'
import { formatCartPrice } from '../shared/format'
import { isServiceLikeCartItem } from '../shared/itemKind'
import { countItemsWithoutPrice } from '../shared/normalize'
import { getRecommendationSeedProductId } from '../shared/recommendations'

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
  const journeyCopy = getJourneyDictionary(resolvedLocale)
  const copy = journeyCopy.cartDrawer
  const [recommended, setRecommended] = useState<RecommendedProduct | null>(null)
  const [open, setOpen] = useState(initialOpen)
  const {
    items,
    itemCount,
    subtotal,
    reloadCart,
    setCartItems,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCartState()
  const itemsWithoutPrice = useMemo(() => countItemsWithoutPrice(items), [items])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const openDrawer = () => {
      reloadCart()
      setOpen(true)
    }
    window.addEventListener(CART_OPEN_EVENT, openDrawer)
    return () => {
      window.removeEventListener(CART_OPEN_EVENT, openDrawer)
    }
  }, [reloadCart])

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

    const seedId = getRecommendationSeedProductId(items)
    if (!seedId) {
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
    setCartItems(next)
  }

  const productSubtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => (isServiceLikeCartItem(item) ? sum : sum + (item.price ?? 0) * item.quantity),
        0,
      ),
    [items],
  )
  const hasProducts = useMemo(() => items.some((item) => !isServiceLikeCartItem(item)), [items])
  const hasServices = useMemo(() => items.some((item) => isServiceLikeCartItem(item)), [items])
  const freeShippingUnlocked = isFreeShippingUnlocked(productSubtotal)
  const remainingForFreeShipping = getRemainingForFreeShipping(productSubtotal)
  const freeShippingProgress = Math.min(
    100,
    Math.max(0, (productSubtotal / FREE_SHIPPING_THRESHOLD_EUR) * 100),
  )
  const remainingLabel = formatCartPrice(remainingForFreeShipping, resolvedLocale)
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
      ariaLabel={journeyCopy.cartPage.cart}
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
                <MediaThumb
                  src={normalizeThumbnailSrc(item.coverImage)}
                  alt={item.title}
                  sizes="144px"
                  className={styles.thumb}
                  imageClassName={styles.thumbImage}
                  unoptimized={isRemoteThumbnailSrc(item.coverImage)}
                />
                <div>
                  <h2 className={`${styles.itemTitle} typo-small-upper`}>{item.title}</h2>
                  {item.brand && <div className={`${styles.itemMeta} typo-caption`}>{item.brand}</div>}
                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={`${styles.qtyButton} typo-body`}
                      onClick={() => decrementItem(item.id)}
                      aria-label={copy.decreaseQuantityAria}
                    >
                      −
                    </button>
                    <span className={`${styles.qtyValue} typo-caption`}>{item.quantity}</span>
                    <button
                      type="button"
                      className={`${styles.qtyButton} typo-body`}
                      onClick={() => incrementItem(item.id)}
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
                    ? formatCartPrice(item.price * item.quantity, resolvedLocale, item.currency)
                    : '—'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.routine}>
          <MediaThumb
            src={normalizeThumbnailSrc(recommended?.coverImage)}
            alt={recommended?.title || copy.completeRoutine}
            sizes="52px"
            className={styles.routineThumb}
            imageClassName={styles.routineThumbImage}
            unoptimized={isRemoteThumbnailSrc(recommended?.coverImage)}
          />
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
            <span>{formatCartPrice(subtotal, resolvedLocale)}</span>
          </div>
          {itemsWithoutPrice > 0 ? (
            <div className={`${styles.itemMeta} typo-caption`}>{copy.pricePendingNotice}</div>
          ) : null}
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
