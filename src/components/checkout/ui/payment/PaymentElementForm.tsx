'use client'

import { useState } from 'react'
import { AddressElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'

import styles from '@/components/checkout/CheckoutClient.module.css'
import { cn } from '@/lib/cn'
import type { CheckoutCopy, CustomerSnapshot, PaymentSession } from '@/components/checkout/shared/contracts'
import { Button } from '@/components/ui/button'

type PaymentElementFormProps = {
  locale: string
  paymentSession: PaymentSession
  customer: CustomerSnapshot
  copy: CheckoutCopy
  onBack: () => void
  onError: (message: string) => void
  onSuccess: (paymentIntentId?: string) => void
}

export function PaymentElementForm({
  locale,
  paymentSession,
  customer,
  copy,
  onBack,
  onError,
  onSuccess,
}: PaymentElementFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [confirming, setConfirming] = useState(false)
  const [billingMode, setBillingMode] = useState<'same' | 'different'>('same')

  const confirmPaymentIntent = async (expressEvent?: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements || confirming) return
    const orderCode = paymentSession.orderNumber || String(paymentSession.orderId || '')
    const returnUrl = `${window.location.origin}/${locale}/checkout/success${orderCode ? `?order=${encodeURIComponent(orderCode)}` : ''}`

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        ...(billingMode === 'same' && !expressEvent
          ? {
              payment_method_data: {
                billing_details: {
                  name: `${customer.firstName} ${customer.lastName}`.trim() || undefined,
                  email: customer.email || undefined,
                  phone: customer.phone || undefined,
                  address: {
                    line1: customer.address || undefined,
                    city: customer.city || undefined,
                    state: customer.province || undefined,
                    postal_code: customer.postalCode || undefined,
                    country: 'IT',
                  },
                },
              },
            }
          : {}),
      },
      redirect: 'if_required',
    })

    if (error) {
      expressEvent?.paymentFailed({
        reason: 'fail',
        message: error.message || copy.messages.paymentFailedRetry,
      })
      onError(error.message || copy.messages.paymentFailedRetry)
      return
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onSuccess(paymentIntent.id)
      return
    }

    expressEvent?.paymentFailed({
      reason: 'fail',
      message: copy.messages.paymentIncomplete,
    })
    onError(copy.messages.paymentIncomplete)
  }

  const handlePay = async () => {
    if (!stripe || !elements || confirming) return
    setConfirming(true)
    onError('')

    try {
      await confirmPaymentIntent()
    } finally {
      setConfirming(false)
    }
  }

  return (
    <>
      <div className={styles.paymentEmbeddedBox}>
        <PaymentElement
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: true,
            },
          }}
        />
      </div>

      <section className={styles.billingSection}>
        <h3 className={cn(styles.billingTitle, 'typo-h3')}>{copy.sections.billingAddress}</h3>
        <p className={cn(styles.paymentDescription, 'typo-body')}>
          {copy.messages.billingAddressDescription}
        </p>
        <div className={styles.billingChoiceCard}>
          <button
            type="button"
            className={cn(
              styles.paymentMethodRow,
              'typo-body',
              billingMode === 'same' && styles.paymentMethodRowActive,
            )}
            onClick={() => setBillingMode('same')}
          >
            <span className={styles.radioDot} aria-hidden />
            <span>{copy.messages.sameAsShipping}</span>
          </button>
          <button
            type="button"
            className={cn(
              styles.paymentMethodRow,
              'typo-body',
              billingMode === 'different' && styles.paymentMethodRowActive,
            )}
            onClick={() => setBillingMode('different')}
          >
            <span className={styles.radioDot} aria-hidden />
            <span>{copy.messages.useDifferentBilling}</span>
          </button>
        </div>
        {billingMode === 'different' ? (
          <div className={styles.billingElementBox}>
            <AddressElement
              options={{
                mode: 'billing',
                fields: {
                  phone: 'always',
                },
                defaultValues: {
                  name: `${customer.firstName} ${customer.lastName}`.trim(),
                  address: {
                    line1: customer.address,
                    postal_code: customer.postalCode,
                    city: customer.city,
                    state: customer.province,
                    country: 'IT',
                  },
                  phone: customer.phone || undefined,
                },
              }}
            />
          </div>
        ) : null}
      </section>

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={cn(styles.returnLinkButton, 'typo-body')}
          onClick={onBack}
          disabled={confirming}
        >
          <span className={cn(styles.returnIcon, 'typo-body-lg')}>‹</span>
          {copy.actions.returnToShipping}
        </button>
        <Button kind="main" size="md" type="button" onClick={handlePay} disabled={confirming}>
          {confirming ? copy.actions.processing : copy.actions.payNow}
        </Button>
      </div>
    </>
  )
}
