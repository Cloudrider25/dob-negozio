import { Elements } from '@stripe/react-stripe-js'
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js'

import { cn } from '@/lib/cn'
import type {
  CheckoutCopy,
  CustomerSnapshot,
  PaymentSession,
  ShippingOption,
} from '@/components/checkout/shared/contracts'
import { formatPrice } from '@/components/checkout/shared/format'
import { PaymentElementForm } from '@/components/checkout/ui/payment/PaymentElementForm'
import styles from '@/components/checkout/CheckoutClient.module.css'

type PaymentStepProps = {
  locale: string
  copy: CheckoutCopy
  formState: CustomerSnapshot
  hasProducts: boolean
  hasServices: boolean
  requiresShippingAddress: boolean
  shippingAddressLabel: string
  selectedShippingOption: ShippingOption | null
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  shippingLabel: string
  serviceAppointmentMode: 'requested_slot' | 'contact_later'
  serviceRequestedDate: string
  serviceRequestedTime: string
  paymentSession: PaymentSession | null
  stripePromise: Promise<Stripe | null> | null
  stripeOptions: StripeElementsOptions | null
  submitting: boolean
  error: string | null
  onBackToInformationStep: () => void
  onBackToShippingStep: () => void
  onPaymentError: (message: string) => void
  onPaymentComplete: (paymentIntentId?: string) => void
}

export function PaymentStep({
  locale,
  copy,
  formState,
  hasProducts,
  hasServices,
  requiresShippingAddress,
  shippingAddressLabel,
  selectedShippingOption,
  productFulfillmentMode,
  shippingLabel,
  serviceAppointmentMode,
  serviceRequestedDate,
  serviceRequestedTime,
  paymentSession,
  stripePromise,
  stripeOptions,
  submitting,
  error,
  onBackToInformationStep,
  onBackToShippingStep,
  onPaymentError,
  onPaymentComplete,
}: PaymentStepProps) {
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
        <div className={styles.shippingSummaryDivider} />
        <div className={styles.shippingSummaryRow}>
          <span className={cn(styles.shippingSummaryLabel, 'typo-small')}>
            {copy.sections.shippingMethod}
          </span>
          <span className={cn(styles.shippingSummaryValue, 'typo-body')}>
            {selectedShippingOption && productFulfillmentMode === 'shipping'
              ? `${selectedShippingOption.name} · ${formatPrice(selectedShippingOption.amount, selectedShippingOption.currency)}`
              : shippingLabel}
          </span>
          <button
            type="button"
            className={cn(styles.changeLink, 'typo-body')}
            onClick={onBackToShippingStep}
          >
            {copy.actions.change}
          </button>
        </div>
        {hasServices ? (
          <>
            <div className={styles.shippingSummaryDivider} />
            <div className={styles.shippingSummaryRow}>
              <span className={cn(styles.shippingSummaryLabel, 'typo-small')}>Appuntamento servizi</span>
              <span className={cn(styles.shippingSummaryValue, 'typo-body')}>
                {serviceAppointmentMode === 'contact_later'
                  ? 'Vi contatto dopo'
                  : serviceRequestedDate && serviceRequestedTime
                    ? `${serviceRequestedDate} · ${serviceRequestedTime}`
                    : 'Da definire'}
              </span>
              <button
                type="button"
                className={cn(styles.changeLink, 'typo-body')}
                onClick={onBackToShippingStep}
              >
                {copy.actions.change}
              </button>
            </div>
          </>
        ) : null}
      </section>

      <section className={styles.paymentSection}>
        <h2 className={cn(styles.paymentTitle, 'typo-h3')}>{copy.sections.payment}</h2>
        <p className={cn(styles.paymentDescription, 'typo-body')}>{copy.messages.secureTransactions}</p>
        {!paymentSession && submitting ? (
          <div className={cn(styles.paymentLoading, 'typo-body')}>
            {copy.messages.loadingPaymentElement}
          </div>
        ) : null}
        {paymentSession && stripePromise && stripeOptions ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PaymentElementForm
              locale={locale}
              paymentSession={paymentSession}
              customer={formState}
              copy={copy}
              onBack={onBackToShippingStep}
              onError={(message) => onPaymentError(message || '')}
              onSuccess={onPaymentComplete}
            />
          </Elements>
        ) : null}
        {!paymentSession && !submitting && error ? (
          <div className={cn(styles.paymentLoadingError, 'typo-body')}>
            {copy.messages.paymentElementLoadErrorPrefix} {error}
          </div>
        ) : null}
      </section>
    </>
  )
}
