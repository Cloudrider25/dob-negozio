import { cn } from '@/lib/shared/ui/cn'
import { MediaThumb } from '@/frontend/components/shared/MediaThumb'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media-core/thumbnail'
import type { CartItem } from '@/lib/frontend/cart/storage'
import type { CheckoutCopy, RecommendedProduct } from '@/frontend/page-domains/checkout/shared/contracts'
import { formatPrice } from '@/frontend/page-domains/checkout/shared/format'
import styles from './CheckoutSummaryPanel.module.css'

type CheckoutSummaryPanelProps = {
  variant: 'desktop' | 'mobile'
  items: CartItem[]
  copy: CheckoutCopy
  subtotal: number
  totalAmount: number
  discountAmount: number
  effectiveShippingCurrency: string
  shippingLabel: string
  discountCodeInput: string
  appliedDiscountCode: string
  discountCodeError: string | null
  onDiscountCodeInputChange: (value: string) => void
  onApplyDiscountCode: () => void
  onRemoveDiscountCode: () => void
  recommended: RecommendedProduct[]
  recommendedLoading: boolean
  onAddRecommendedToCart: (product: RecommendedProduct) => void
}

export function CheckoutSummaryPanel({
  variant,
  items,
  copy,
  subtotal,
  totalAmount,
  discountAmount,
  effectiveShippingCurrency,
  shippingLabel,
  discountCodeInput,
  appliedDiscountCode,
  discountCodeError,
  onDiscountCodeInputChange,
  onApplyDiscountCode,
  onRemoveDiscountCode,
  recommended,
  recommendedLoading,
  onAddRecommendedToCart,
}: CheckoutSummaryPanelProps) {
  const discountedSubtotal = Math.max(0, subtotal - discountAmount)

  return (
    <aside
      className={cn(
        styles.summary,
        variant === 'desktop' ? styles.summaryDesktop : styles.summaryMobile,
      )}
    >
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
              <div className={`${styles.summaryMeta} typo-body`}>
                {item.format || item.brand || copy.messages.defaultProductLabel}
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
        <input
          className={`${styles.input} typo-body`}
          placeholder={copy.placeholders.discountCode}
          value={discountCodeInput}
          onChange={(event) => onDiscountCodeInputChange(event.target.value)}
        />
        <button type="button" className={cn(styles.applyButton, 'typo-body')} onClick={onApplyDiscountCode}>
          {copy.actions.apply}
        </button>
      </div>
      {discountCodeError ? (
        <div className={cn(styles.discountCodeError, 'typo-small')}>{discountCodeError}</div>
      ) : null}
      {appliedDiscountCode ? (
        <div className={`${styles.summaryMeta} typo-small`}>
          Codice applicato: {appliedDiscountCode}{' '}
          <button type="button" className={cn(styles.applyButton, 'typo-body')} onClick={onRemoveDiscountCode}>
            x
          </button>
        </div>
      ) : null}

      <div className={`${styles.summaryRow} typo-body-lg`}>
        <span>{copy.summary.subtotal}</span>
        <span>{formatPrice(discountedSubtotal, effectiveShippingCurrency)}</span>
      </div>
      <div className={`${styles.summaryRow} typo-body-lg`}>
        <span>{copy.summary.shipping}</span>
        <span className={`${styles.summaryMeta} typo-small`}>{shippingLabel}</span>
      </div>
      {discountAmount > 0 ? (
        <div className={`${styles.summaryRow} typo-body-lg`}>
          <span>{copy.placeholders.discountCode}</span>
          <span>- {formatPrice(discountAmount, effectiveShippingCurrency)}</span>
        </div>
      ) : null}
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
                {product.format || typeof product.price === 'number' ? (
                  <div className={styles.summaryRecoMetaRow}>
                    {product.format ? (
                      <p className={`${styles.summaryRecoFormat} typo-body`}>{product.format}</p>
                    ) : <span />}
                    {typeof product.price === 'number' ? (
                      <p className={`${styles.summaryRecoPrice} typo-body`}>
                        {formatPrice(product.price, product.currency)}
                      </p>
                    ) : null}
                  </div>
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
