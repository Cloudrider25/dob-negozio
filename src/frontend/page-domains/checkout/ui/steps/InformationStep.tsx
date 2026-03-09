import Link from 'next/link'
import type { Dispatch, SetStateAction } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import type { StripeElementsOptions, Stripe } from '@stripe/stripe-js'

import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'
import { Select } from '@/frontend/components/ui/primitives/input'
import { cn } from '@/lib/shared/ui/cn'
import type { CheckoutCopy, CustomerSnapshot, PaymentSession } from '@/frontend/page-domains/checkout/shared/contracts'
import { ExpressCheckoutQuickForm } from '@/frontend/page-domains/checkout/ui/payment/ExpressCheckoutQuickForm'

type InformationStepProps = {
  locale: string
  copy: CheckoutCopy
  formState: CustomerSnapshot
  setFormState: Dispatch<SetStateAction<CustomerSnapshot>>
  requiresShippingAddress: boolean
  isFormComplete: boolean
  submitting: boolean
  paymentSession: PaymentSession | null
  stripePromise: Promise<Stripe | null> | null
  stripeOptions: StripeElementsOptions | null
  expressPrefetchTried: boolean
  expressPrefetchError: string | null
  onExpressRetry: () => void
  onExpressError: (message: string) => void
  onExpressSuccess: (paymentIntentId?: string) => void
  onGoToShippingStep: () => void
}

export function InformationStep({
  locale,
  copy,
  formState,
  setFormState,
  requiresShippingAddress,
  isFormComplete,
  submitting,
  paymentSession,
  stripePromise,
  stripeOptions,
  expressPrefetchTried,
  expressPrefetchError,
  onExpressRetry,
  onExpressError,
  onExpressSuccess,
  onGoToShippingStep,
}: InformationStepProps) {
  return (
    <>
      {!requiresShippingAddress && paymentSession && stripePromise && stripeOptions ? (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <ExpressCheckoutQuickForm
            locale={locale}
            paymentSession={paymentSession}
            copy={copy}
            onError={(message) => onExpressError(message || '')}
            onSuccess={onExpressSuccess}
          />
        </Elements>
      ) : !requiresShippingAddress && submitting ? (
        <div className={cn(styles.paymentLoading, 'typo-body')}>{copy.messages.loadingPaymentElement}</div>
      ) : !requiresShippingAddress && expressPrefetchTried && expressPrefetchError ? (
        <div className={cn(styles.paymentLoadingError, 'typo-body')}>
          {expressPrefetchError}
          <div className={styles.actionsRow}>
            <button
              className={cn(styles.continueButton, 'typo-small-upper')}
              type="button"
              onClick={onExpressRetry}
            >
              Riprova
            </button>
          </div>
        </div>
      ) : !requiresShippingAddress ? (
        <div className={cn(styles.paymentLoading, 'typo-body')}>{copy.messages.loadingPaymentElement}</div>
      ) : null}

      <div className={styles.fieldGroup}>
        <div className={cn(styles.labelRow, 'typo-small')}>
          <span>{copy.contact}</span>
        </div>
        <input
          className={cn(styles.input, 'typo-body')}
          placeholder={copy.placeholders.email}
          value={formState.email}
          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
        />
      </div>

      <div className={styles.fieldGroup}>
        <div className={cn(styles.labelRow, 'typo-small')}>
          <span>{copy.shippingAddress}</span>
        </div>
        <Select
          id="checkout-country"
          name="country"
          className={cn(styles.select, 'typo-body')}
          defaultValue={copy.country}
        >
          <option value={copy.country}>{copy.country}</option>
        </Select>
        <div className={styles.splitRow}>
          <input
            className={cn(styles.input, 'typo-body')}
            placeholder={copy.placeholders.firstName}
            value={formState.firstName}
            onChange={(event) => setFormState((prev) => ({ ...prev, firstName: event.target.value }))}
          />
          <input
            className={cn(styles.input, 'typo-body')}
            placeholder={copy.placeholders.lastName}
            value={formState.lastName}
            onChange={(event) => setFormState((prev) => ({ ...prev, lastName: event.target.value }))}
          />
        </div>
        <input
          className={cn(styles.input, 'typo-body')}
          placeholder={copy.placeholders.address}
          value={formState.address}
          onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
        />
        <div className={styles.splitRowThree}>
          <input
            className={cn(styles.input, 'typo-body')}
            placeholder={copy.placeholders.postalCode}
            value={formState.postalCode}
            onChange={(event) => setFormState((prev) => ({ ...prev, postalCode: event.target.value }))}
          />
          <input
            className={cn(styles.input, 'typo-body')}
            placeholder={copy.placeholders.city}
            value={formState.city}
            onChange={(event) => setFormState((prev) => ({ ...prev, city: event.target.value }))}
          />
          <input
            className={cn(styles.input, 'typo-body')}
            placeholder={copy.placeholders.province}
            value={formState.province}
            onChange={(event) => setFormState((prev) => ({ ...prev, province: event.target.value }))}
          />
        </div>
        <input
          className={cn(styles.input, 'typo-body')}
          placeholder={copy.placeholders.phoneOptional}
          value={formState.phone}
          onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
        />
      </div>

      <div className={styles.actionsRow}>
        <Link className={cn(styles.returnLink, 'typo-body')} href={`/${locale}/cart`}>
          <span className={cn(styles.returnIcon, 'typo-body-lg')}>‹</span>
          {copy.actions.returnToCart}
        </Link>
        <button
          className={cn(styles.continueButton, 'typo-small-upper')}
          type="button"
          disabled={submitting || !isFormComplete}
          onClick={onGoToShippingStep}
        >
          {copy.actions.goToShipping}
        </button>
      </div>
    </>
  )
}
