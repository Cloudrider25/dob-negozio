import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type {
  CheckoutCopy,
  CustomerSnapshot,
  ShippingOption,
} from '@/components/checkout/shared/contracts'
import { formatPrice } from '@/components/checkout/shared/format'
import styles from '@/components/checkout/CheckoutClient.module.css'

type ShippingStepProps = {
  copy: CheckoutCopy
  formState: CustomerSnapshot
  hasProducts: boolean
  hasServices: boolean
  requiresShippingAddress: boolean
  shippingAddressLabel: string
  shippingLoading: boolean
  shippingOptions: ShippingOption[]
  selectedShippingOptionID: string | null
  setSelectedShippingOptionID: Dispatch<SetStateAction<string | null>>
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  setProductFulfillmentMode: Dispatch<SetStateAction<'shipping' | 'pickup' | 'none'>>
  serviceAppointmentMode: 'requested_slot' | 'contact_later'
  setServiceAppointmentMode: Dispatch<SetStateAction<'requested_slot' | 'contact_later'>>
  serviceRequestedDate: string
  setServiceRequestedDate: Dispatch<SetStateAction<string>>
  serviceRequestedTime: string
  setServiceRequestedTime: Dispatch<SetStateAction<string>>
  shippingNoticeBlocks: string[]
  submitting: boolean
  onBackToInformationStep: () => void
  onGoToPaymentStep: () => void
}

export function ShippingStep({
  copy,
  formState,
  hasProducts,
  hasServices,
  requiresShippingAddress,
  shippingAddressLabel,
  shippingLoading,
  shippingOptions,
  selectedShippingOptionID,
  setSelectedShippingOptionID,
  productFulfillmentMode,
  setProductFulfillmentMode,
  serviceAppointmentMode,
  setServiceAppointmentMode,
  serviceRequestedDate,
  setServiceRequestedDate,
  serviceRequestedTime,
  setServiceRequestedTime,
  shippingNoticeBlocks,
  submitting,
  onBackToInformationStep,
  onGoToPaymentStep,
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
        <div className={styles.shippingSummaryDivider} />
        <div className={styles.shippingSummaryRow}>
          <span className={cn(styles.shippingSummaryLabel, 'typo-small')}>{copy.shippingAddress}</span>
          <span className={cn(styles.shippingSummaryValue, 'typo-body')}>
            {requiresShippingAddress
              ? shippingAddressLabel || '—'
              : hasProducts
                ? 'Ritiro in negozio'
                : 'Non richiesta'}
          </span>
          <button
            type="button"
            className={cn(styles.changeLink, 'typo-body')}
            onClick={onBackToInformationStep}
          >
            {copy.actions.change}
          </button>
        </div>
      </section>

      <section className={styles.shippingMethodSection}>
        <h2 className={cn(styles.shippingMethodTitle, 'typo-h3')}>{copy.sections.shippingMethod}</h2>
        <div className={styles.shippingMethodCard}>
          {hasProducts ? (
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
                  <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>Ritiro in negozio</p>
                  <p className={cn(styles.shippingMethodEta, 'typo-body')}>Gratuito</p>
                </div>
              </button>
            </div>
          ) : (
            <p className={cn(styles.shippingMethodEta, 'typo-body')}>
              Nessuna spedizione richiesta (solo servizi)
            </p>
          )}
        </div>
        {hasProducts && productFulfillmentMode === 'shipping' ? (
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
                      className={cn(styles.shippingMethodOption, isActive && styles.shippingMethodOptionActive)}
                      onClick={() => setSelectedShippingOptionID(option.id)}
                    >
                      <div>
                        <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>{option.name}</p>
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

      {hasServices ? (
        <section className={styles.shippingMethodSection}>
          <h2 className={cn(styles.shippingMethodTitle, 'typo-h3')}>Prenotazione servizi</h2>
          <div className={styles.shippingMethodCard}>
            <div className={styles.shippingMethodList}>
              <button
                type="button"
                className={cn(
                  styles.shippingMethodOption,
                  serviceAppointmentMode === 'requested_slot' && styles.shippingMethodOptionActive,
                )}
                onClick={() => setServiceAppointmentMode('requested_slot')}
              >
                <div>
                  <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>Scelgo data e ora preferita</p>
                  <p className={cn(styles.shippingMethodEta, 'typo-body')}>Richiesta da confermare</p>
                </div>
              </button>
              <button
                type="button"
                className={cn(
                  styles.shippingMethodOption,
                  serviceAppointmentMode === 'contact_later' && styles.shippingMethodOptionActive,
                )}
                onClick={() => setServiceAppointmentMode('contact_later')}
              >
                <div>
                  <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>Vi contatto dopo</p>
                  <p className={cn(styles.shippingMethodEta, 'typo-body')}>
                    Definiamo appuntamento successivamente
                  </p>
                </div>
              </button>
            </div>
          </div>

          {serviceAppointmentMode === 'requested_slot' ? (
            <div className={styles.shippingMethodCard}>
              <div className={styles.splitRow}>
                <input
                  className={cn(styles.input, 'typo-body')}
                  type="date"
                  value={serviceRequestedDate}
                  onChange={(event) => setServiceRequestedDate(event.target.value)}
                />
                <input
                  className={cn(styles.input, 'typo-body')}
                  type="time"
                  value={serviceRequestedTime}
                  onChange={(event) => setServiceRequestedTime(event.target.value)}
                />
              </div>
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
        <Button kind="main" size="md" type="button" disabled={submitting} onClick={onGoToPaymentStep}>
          {copy.actions.continueToPayment}
        </Button>
      </div>
    </>
  )
}
