'use client'

import { MediaThumb } from '@/components/shared/MediaThumb'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Minus, Plus, Trash } from '@/components/ui/icons'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import { useCartState } from '../hooks/useCartState'
import { formatCartPrice } from '../shared/format'
import { countItemsWithoutPrice } from '../shared/normalize'
import styles from './CartPageClient.module.css'

export function CartPageClient({ locale }: { locale: string }) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).cartPage
  const { items, subtotal, incrementItem, decrementItem, removeItem } = useCartState()
  const itemsWithoutPrice = countItemsWithoutPrice(items)

  return (
    <div className={styles.page}>
      <div className={`${styles.breadcrumbsRow} typo-small`}>
        <div className={`${styles.breadcrumbs} typo-small-upper`}>
          <span>{copy.home}</span>
          <span>›</span>
          <span>{copy.cart}</span>
        </div>
        <ButtonLink
          href={`/${locale}/shop`}
          kind="main"
          size="sm"
          className={styles.backToShop}
        >
          {copy.returnToShopping}
        </ButtonLink>
      </div>

      <section className={styles.tableSection}>
        <div className={`${styles.tableHead} typo-small-upper`}>
          <span>{copy.product}</span>
          <span>{copy.price}</span>
          <span>{copy.quantity}</span>
          <span>{copy.subtotal}</span>
          <span />
        </div>

        <div className={styles.rows}>
          {items.length === 0 && (
            <div className={`${styles.empty} typo-body`}>{copy.empty}</div>
          )}
          {items.map((item) => {
            const rowSubtotal = (item.price ?? 0) * item.quantity
            return (
              <div
                key={item.id}
                className={styles.row}
              >
                <div className={styles.productCell}>
                  <MediaThumb
                    src={normalizeThumbnailSrc(item.coverImage)}
                    alt={item.title}
                    sizes="112px"
                    className={styles.thumb}
                    imageClassName={styles.thumbImage}
                    fallback={<div className={styles.thumbFallback} />}
                    unoptimized={isRemoteThumbnailSrc(item.coverImage)}
                  />
                  <div>
                    <h2 className={`${styles.productTitle} typo-body`}>{item.title}</h2>
                    {item.brand && <div className={`${styles.productBrand} typo-caption`}>{item.brand}</div>}
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <div className={styles.metaGroup}>
                    <span className={`${styles.metaLabel} typo-caption-upper`}>{copy.price}</span>
                    <span className={`${styles.metaValue} typo-small`}>
                      {typeof item.price === 'number' ? formatCartPrice(item.price, resolvedLocale, item.currency) : '—'}
                    </span>
                  </div>
                  <div className={styles.metaGroup}>
                    <span className={`${styles.metaLabel} typo-caption-upper`}>{copy.quantity}</span>
                    <div className={styles.qtyRow}>
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      className={styles.qtyButton}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className={`${styles.qtyValue} typo-small`}>
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      className={styles.qtyButton}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                  <div className={styles.metaGroup}>
                    <span className={`${styles.metaLabel} typo-caption-upper`}>{copy.subtotal}</span>
                    <span className={`${styles.metaValue} typo-small`}>
                      {typeof item.price === 'number' ? formatCartPrice(rowSubtotal, resolvedLocale, item.currency) : '—'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className={styles.removeButton}
                >
                  <Trash className={styles.removeIcon} />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.leftCol}>
          <div className={`${styles.sectionTitle} typo-h3`}>
            {copy.completeOrder}
          </div>
          <div className={`${styles.steps} typo-caption-upper`}>
            {[
              copy.steps.login,
              copy.steps.addresses,
              copy.steps.shipping,
              copy.steps.payment,
              copy.steps.confirmation,
            ].map((step, index) => (
              <div key={step} className={styles.step}>
                <div
                  className={`${styles.stepDot} ${index === 0 ? styles.stepDotActive : ''}`}
                />
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <h3 className={`${styles.cardTitle} typo-h3`}>
              {copy.guestBox.title}
            </h3>
            <p className={`${styles.cardBody} typo-small`}>
              {copy.guestBox.description}
            </p>
            <div className={`${styles.cardMuted} typo-small`}>{copy.guestBox.selectOption}</div>
            <div className={styles.guestOptions}>
              {[copy.guestBox.guest, copy.guestBox.login, copy.guestBox.register].map((label) => (
                <label
                  key={label}
                  className={`${styles.guestOption} typo-small`}
                >
                  <input type="radio" name="checkout" className="accent-black" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h3 className={`${styles.cardTitle} typo-h3`}>{copy.discount.title}</h3>
            <p className={`${styles.cardMuted} typo-small`}>
              {copy.discount.description}
            </p>
            <div className={styles.discountRow}>
              <input
                className={`${styles.discountInput} typo-small`}
                placeholder={copy.discount.placeholder}
              />
              <Button type="button" kind="main" size="sm">
                {copy.discount.apply}
              </Button>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={`${styles.cardTitle} typo-h3`}>{copy.summary.title}</h3>
            <div className={`${styles.summaryRow} typo-small`}>
              <span>{copy.subtotal}</span>
              <span>{formatCartPrice(subtotal, resolvedLocale)}</span>
            </div>
            {itemsWithoutPrice > 0 ? (
              <div className={`${styles.cardMuted} typo-caption`}>{copy.summary.pricePendingNotice}</div>
            ) : null}
            <div className={`${styles.cardMuted} typo-caption`}>{copy.summary.taxesIncluded}</div>
            <div className={`${styles.summaryRow} typo-small`}>
              <span>{copy.summary.shipping}</span>
              <span>{formatCartPrice(0, resolvedLocale)}</span>
            </div>
            <div className={`${styles.cardMuted} typo-caption`}>{copy.summary.country}</div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal} typo-body`}>
              <span>{copy.summary.total}</span>
              <span>{formatCartPrice(subtotal, resolvedLocale)}</span>
            </div>
            <ButtonLink
              href={`/${locale}/checkout`}
              kind="main"
              size="md"
              className={styles.checkoutLink}
            >
              {copy.checkoutCta}
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
