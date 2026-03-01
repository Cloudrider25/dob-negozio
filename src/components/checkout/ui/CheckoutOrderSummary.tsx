import { cn } from '@/lib/cn'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import type { CartItem } from '@/lib/cartStorage'
import type { CheckoutCopy, RecommendedProduct } from '@/components/checkout/shared/contracts'
import { formatPrice } from '@/components/checkout/shared/format'
import styles from '@/components/checkout/CheckoutClient.module.css'

type CheckoutOrderSummaryProps = {
  isDesktopViewport: boolean
  items: CartItem[]
  copy: CheckoutCopy
  subtotal: number
  totalAmount: number
  effectiveShippingCurrency: string
  shippingLabel: string
  recommended: RecommendedProduct[]
  recommendedLoading: boolean
  onAddRecommendedToCart: (product: RecommendedProduct) => void
}

export function CheckoutOrderSummary({
  isDesktopViewport,
  items,
  copy,
  subtotal,
  totalAmount,
  effectiveShippingCurrency,
  shippingLabel,
  recommended,
  recommendedLoading,
  onAddRecommendedToCart,
}: CheckoutOrderSummaryProps) {
  if (!isDesktopViewport) return null

  return (
    <aside className={styles.summary}>
      {items.length === 0 ? (
        <div className={`${styles.summaryMeta} typo-small`}>{copy.messages.cartEmpty}</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className={styles.summaryItem}>
            <MediaThumb
              src={normalizeThumbnailSrc(item.coverImage)}
              alt={item.title}
              sizes="56px"
              className={styles.summaryThumb}
              imageClassName={styles.summaryThumbImage}
              unoptimized={isRemoteThumbnailSrc(item.coverImage)}
            >
              <span className={`${styles.summaryQtyBadge} typo-caption`}>{item.quantity}</span>
            </MediaThumb>
            <div>
              <p className={`${styles.summaryTitle} typo-body-lg`}>{item.title}</p>
              <div className={`${styles.summaryMeta} typo-small`}>
                {item.brand || copy.messages.defaultProductLabel}
              </div>
            </div>
            <div className={`${styles.summaryPrice} typo-body-lg`}>
              {typeof item.price === 'number'
                ? formatPrice(item.price * item.quantity, item.currency)
                : '—'}
            </div>
          </div>
        ))
      )}

      <div className={styles.codeRow}>
        <input className={`${styles.input} typo-body`} placeholder={copy.placeholders.discountCode} />
        <button type="button" className={cn(styles.applyButton, 'typo-body')}>
          {copy.actions.apply}
        </button>
      </div>

      <div className={`${styles.summaryRow} typo-body-lg`}>
        <span>{copy.summary.subtotal}</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className={`${styles.summaryRow} typo-body-lg`}>
        <span>{copy.summary.shipping}</span>
        <span className={`${styles.summaryMeta} typo-small`}>{shippingLabel}</span>
      </div>
      <div className={`${styles.totalRow} typo-h3`}>
        <span>{copy.summary.total}</span>
        <span>{formatPrice(totalAmount, effectiveShippingCurrency)}</span>
      </div>
      <p className={`${styles.summaryTaxNote} typo-body`}>{copy.messages.includingTaxes}</p>

      <h3 className={`${styles.summaryRecoTitle} typo-h3`}>{copy.sections.recommendations}</h3>
      <div className={styles.summaryRecoList}>
        {recommendedLoading ? (
          <p className={`${styles.summaryMeta} typo-small`}>{copy.messages.loadingRecommendations}</p>
        ) : recommended.length === 0 ? (
          <p className={`${styles.summaryMeta} typo-small`}>{copy.messages.noRecommendations}</p>
        ) : (
          recommended.map((product) => (
            <div key={product.id} className={styles.summaryRecoItem}>
              <MediaThumb
                src={normalizeThumbnailSrc(product.coverImage)}
                alt={product.title}
                sizes="64px"
                className={styles.summaryRecoThumb}
                imageClassName={styles.summaryRecoThumbImage}
                unoptimized={isRemoteThumbnailSrc(product.coverImage)}
              />
              <div className={styles.summaryRecoContent}>
                <p className={`${styles.summaryRecoName} typo-body-lg`}>{product.title}</p>
                {product.format ? (
                  <p className={`${styles.summaryRecoFormat} typo-body`}>{product.format}</p>
                ) : null}
                {typeof product.price === 'number' ? (
                  <p className={`${styles.summaryRecoPrice} typo-body`}>
                    {formatPrice(product.price, product.currency)}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className={cn(styles.summaryRecoAction, 'typo-body')}
                onClick={() => onAddRecommendedToCart(product)}
              >
                {copy.actions.add}
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
