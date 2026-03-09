'use client'

import { useMemo, useState } from 'react'

import { MediaThumb } from '@/frontend/components/shared/MediaThumb'
import { ButtonLink } from '@/frontend/components/ui/primitives/button-link'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n/core'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media-core/thumbnail'
import {
  FREE_SHIPPING_THRESHOLD_EUR,
  getRemainingForFreeShipping,
  isFreeShippingUnlocked,
} from '@/lib/shared/shop/shipping'
import { cn } from '@/lib/shared/ui/cn'
import { useCartState } from '../hooks/useCartState'
import { formatCartPrice } from '../shared/format'
import { isServiceLikeCartItem } from '../shared/itemKind'
import styles from './CartPageClient.module.css'

export function CartPageClient({ locale }: { locale: string }) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const dictionary = getJourneyDictionary(resolvedLocale)
  const copy = dictionary.cartPage
  const drawerCopy = dictionary.cartDrawer
  const { items, itemCount, subtotal, incrementItem, decrementItem } = useCartState()
  const [discountCode, setDiscountCode] = useState('')
  const productSubtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => (isServiceLikeCartItem(item) ? sum : sum + (item.price ?? 0) * item.quantity),
        0,
      ),
    [items],
  )
  const hasProducts = useMemo(() => items.some((item) => !isServiceLikeCartItem(item)), [items])
  const freeShippingUnlocked = isFreeShippingUnlocked(productSubtotal)
  const remainingForFreeShipping = getRemainingForFreeShipping(productSubtotal)
  const freeShippingProgress = Math.min(
    100,
    Math.max(0, (productSubtotal / FREE_SHIPPING_THRESHOLD_EUR) * 100),
  )
  const freeShippingNote = freeShippingUnlocked
    ? 'Free standard shipping unlocked'
    : `${formatCartPrice(remainingForFreeShipping, resolvedLocale)} away from free standard shipping`

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={cn(styles.itemsCount, 'typo-h2')}>
            {itemCount} {drawerCopy.itemsLabel}
          </h1>
          {hasProducts ? (
            <>
              <p className={cn(styles.shippingNote, 'typo-body-lg')}>{freeShippingNote}</p>
              <div className={styles.progress}>
                <div className={styles.progressFill} style={{ width: `${freeShippingProgress}%` }} />
              </div>
            </>
          ) : null}
        </header>

        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={cn(styles.empty, 'typo-body')}>{copy.empty}</div>
          ) : (
            items.map((item) => {
              const rowSubtotal = (item.price ?? 0) * item.quantity
              return (
                <article key={item.id} className={styles.item}>
                  <MediaThumb
                    src={normalizeThumbnailSrc(item.coverImage)}
                    alt={item.title}
                    sizes="84px"
                    className={styles.thumb}
                    imageClassName={styles.thumbImage}
                    fallback={<div className={styles.thumbFallback} />}
                    unoptimized={isRemoteThumbnailSrc(item.coverImage)}
                  />
                  <div className={styles.itemBody}>
                    <div className={styles.itemHead}>
                      <div className={styles.itemText}>
                        <h2 className={cn(styles.itemTitle, 'typo-body-lg')}>{item.title}</h2>
                        {(item.format || item.brand) ? (
                          <p className={cn(styles.itemMeta, 'typo-body')}>
                            {item.format || item.brand}
                          </p>
                        ) : null}
                      </div>
                      <div className={cn(styles.itemPrice, 'typo-body-lg')}>
                        {typeof item.price === 'number'
                          ? formatCartPrice(rowSubtotal, resolvedLocale, item.currency)
                          : '—'}
                      </div>
                    </div>

                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => decrementItem(item.id)}
                        aria-label={copy.quantity}
                      >
                        −
                      </button>
                      <span className={cn(styles.qtyValue, 'typo-body')}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => incrementItem(item.id)}
                        aria-label={copy.quantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>

        <section className={styles.summary}>
          <div className={styles.discountBox}>
            <label htmlFor="cart-discount" className={cn(styles.discountLabel, 'typo-small-upper')}>
              {copy.discount.title}
            </label>
            <div className={styles.discountRow}>
              <input
                id="cart-discount"
                name="discountCode"
                className={cn(styles.discountInput, 'typo-body')}
                placeholder={copy.discount.placeholder}
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value)}
              />
            </div>
          </div>

          <div className={cn(styles.summaryRow, 'typo-body-lg')}>
            <span>{copy.subtotal}</span>
            <span>{formatCartPrice(subtotal, resolvedLocale)}</span>
          </div>
          <p className={cn(styles.summaryNote, 'typo-body')}>
            {drawerCopy.summaryNote}
          </p>
          <ButtonLink href={`/${locale}/checkout`} kind="main" size="md" className={styles.checkoutLink}>
            {copy.checkoutCta}
          </ButtonLink>
        </section>
      </div>
    </section>
  )
}
