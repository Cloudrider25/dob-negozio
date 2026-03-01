'use client'

import { useState } from 'react'
import { ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'

import styles from '@/components/checkout/CheckoutClient.module.css'
import type { CheckoutCopy, PaymentSession } from '@/components/checkout/shared/contracts'

type ExpressCheckoutQuickFormProps = {
  locale: string
  paymentSession: PaymentSession
  copy: CheckoutCopy
  onError: (message: string) => void
  onSuccess: (paymentIntentId?: string) => void
}

export function ExpressCheckoutQuickForm({
  locale,
  paymentSession,
  copy,
  onError,
  onSuccess,
}: ExpressCheckoutQuickFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [confirming, setConfirming] = useState(false)
  const [hasExpressMethods, setHasExpressMethods] = useState(true)

  const handleExpressConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements || confirming) return
    setConfirming(true)
    onError('')

    try {
      const orderCode = paymentSession.orderNumber || String(paymentSession.orderId || '')
      const returnUrl = `${window.location.origin}/${locale}/checkout/success${orderCode ? `?order=${encodeURIComponent(orderCode)}` : ''}`

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      })

      if (error) {
        event.paymentFailed({
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

      event.paymentFailed({
        reason: 'fail',
        message: copy.messages.paymentIncomplete,
      })
      onError(copy.messages.paymentIncomplete)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <section className={styles.expressPaymentSection}>
      <p className={`${styles.expressTitle} typo-caption-upper`}>{copy.expressCheckout}</p>
      <div className={styles.expressEmbeddedBox}>
        <ExpressCheckoutElement
          onConfirm={handleExpressConfirm}
          onReady={({ availablePaymentMethods }) => {
            setHasExpressMethods(Boolean(availablePaymentMethods))
          }}
          options={{
            layout: {
              maxColumns: 3,
              maxRows: 1,
              overflow: 'auto',
            },
            paymentMethodOrder: ['apple_pay', 'google_pay', 'paypal', 'link'],
            paymentMethods: {
              applePay: 'always',
              googlePay: 'always',
              paypal: 'auto',
              link: 'auto',
            },
          }}
        />
      </div>
      {!hasExpressMethods ? (
        <p className={`${styles.expressUnavailableNote} typo-body`}>{copy.messages.shippingNoMethods}</p>
      ) : null}
    </section>
  )
}
