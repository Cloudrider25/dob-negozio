import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@/frontend/components/ui/primitives/button'
import { cn } from '@/lib/shared/ui/cn'
import type {
  CheckoutCopy,
  CustomerSnapshot,
  ShippingOption,
} from '@/frontend/page-domains/checkout/shared/contracts'
import { formatPrice } from '@/frontend/page-domains/checkout/shared/format'
import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'

type ShippingStepProps = {
  copy: CheckoutCopy
  formState: CustomerSnapshot
  hasProducts: boolean
  requiresShippingAddress: boolean
  shippingAddressLabel: string
  shippingLoading: boolean
  shippingOptions: ShippingOption[]
  selectedShippingOptionID: string | null
  setSelectedShippingOptionID: Dispatch<SetStateAction<string | null>>
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  setProductFulfillmentMode: Dispatch<SetStateAction<'shipping' | 'pickup' | 'none'>>
  shippingNoticeBlocks: string[]
  submitting: boolean
  onBackToInformationStep: () => void
  onGoToNextStep: () => void
  nextStepLabel: string
}

export function ShippingStep({
  copy,
  formState,
  hasProducts,
  requiresShippingAddress,
  shippingAddressLabel,
  shippingLoading,
  shippingOptions,
  selectedShippingOptionID,
  setSelectedShippingOptionID,
  productFulfillmentMode,
  setProductFulfillmentMode,
  shippingNoticeBlocks,
  submitting,
  onBackToInformationStep,
  onGoToNextStep,
  nextStepLabel,
}: ShippingStepProps) {
  return (
    <>
      <section className={styles.shippingSummaryCard}>
        <div className={styles.shippingSummaryRow}>
          <span className={cn(styles.shippingSummaryLabel, 'typo-small')}>{copy.contact}</span>
          <span className={cn(styles.shippingSummaryValue, 'typo-body')}>{formState.email || '—'}</span>
          <button
            type="button"
            className={cn(styles.changeLink, 'typo-body')}
            onClick={onBackToInformationStep}
          >
            {copy.actions.change}
          </button>
        </div>
        {hasProducts ? (
          <>
            <div className={styles.shippingSummaryDivider} />
            <div className={styles.shippingSummaryRow}>
              <span className={cn(styles.shippingSummaryLabel, 'typo-small')}>
                {copy.shippingAddress}
              </span>
              <span className={cn(styles.shippingSummaryValue, 'typo-body')}>
                {requiresShippingAddress ? shippingAddressLabel || '—' : 'Ritiro in negozio'}
              </span>
              <button
                type="button"
                className={cn(styles.changeLink, 'typo-body')}
                onClick={onBackToInformationStep}
              >
                {copy.actions.change}
              </button>
            </div>
          </>
        ) : null}
      </section>

      {hasProducts ? (
        <section className={styles.shippingMethodSection}>
          <h2 className={cn(styles.shippingMethodTitle, 'typo-h3')}>
            {copy.sections.shippingMethod}
          </h2>
          <div className={styles.shippingMethodCard}>
            <div className={styles.shippingMethodList}>
              <button
                type="button"
                className={cn(
                  styles.shippingMethodOption,
                  productFulfillmentMode === 'shipping' && styles.shippingMethodOptionActive,
                )}
                onClick={() => setProductFulfillmentMode('shipping')}
              >
                <div>
                  <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>Spedizione</p>
                </div>
              </button>
              <button
                type="button"
                className={cn(
                  styles.shippingMethodOption,
                  productFulfillmentMode === 'pickup' && styles.shippingMethodOptionActive,
                )}
                onClick={() => setProductFulfillmentMode('pickup')}
              >
                <div>
                  <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>
                    Ritiro in negozio
                  </p>
                  <p className={cn(styles.shippingMethodEta, 'typo-body')}>Gratuito</p>
                </div>
              </button>
            </div>
          </div>
          {productFulfillmentMode === 'shipping' ? (
            <div className={styles.shippingMethodCard}>
              {shippingLoading ? (
                <p className={cn(styles.shippingMethodEta, 'typo-body')}>
                  {copy.messages.shippingLoadingMethods}
                </p>
              ) : shippingOptions.length === 0 ? (
                <p className={cn(styles.shippingMethodEta, 'typo-body')}>
                  {copy.messages.shippingNoMethods}
                </p>
              ) : (
                <div className={styles.shippingMethodList}>
                  {shippingOptions.map((option) => {
                    const isActive = option.id === selectedShippingOptionID
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          styles.shippingMethodOption,
                          isActive && styles.shippingMethodOptionActive,
                        )}
                        onClick={() => setSelectedShippingOptionID(option.id)}
                      >
                        <div>
                          <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>
                            {option.name}
                          </p>
                          {option.deliveryEstimate ? (
                            <p className={cn(styles.shippingMethodEta, 'typo-body')}>
                              {option.deliveryEstimate}
                            </p>
                          ) : null}
                        </div>
                        <strong className={cn(styles.shippingMethodPrice, 'typo-h3')}>
                          {formatPrice(option.amount, option.currency)}
                        </strong>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {shippingNoticeBlocks.length > 0 ? (
        <div className={cn(styles.shippingNote, 'typo-body')}>
          {shippingNoticeBlocks.map((block, index) => (
            <p key={`${block}-${index}`}>{block}</p>
          ))}
        </div>
      ) : null}

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={cn(styles.returnLinkButton, 'typo-body')}
          onClick={onBackToInformationStep}
        >
          <span className={cn(styles.returnIcon, 'typo-body-lg')}>‹</span>
          {copy.actions.returnToInformation}
        </button>
        <Button
          kind="main"
          size="md"
          type="button"
          disabled={submitting}
          onClick={onGoToNextStep}
        >
          {nextStepLabel}
        </Button>
      </div>
    </>
  )
}
