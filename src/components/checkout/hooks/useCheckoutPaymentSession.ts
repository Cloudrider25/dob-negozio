'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'

import { createPaymentElementSession, CheckoutSessionError } from '@/components/checkout/client-api/paymentSession'
import type { CustomerSnapshot, PaymentSession } from '@/components/checkout/shared/contracts'
import { STRIPE_LOCALE_MAP } from '@/components/checkout/shared/contracts'
import type { CartItem } from '@/lib/cartStorage'

export const useCheckoutPaymentSession = ({
  activeStep,
  locale,
  formState,
  items,
  selectedShippingOptionID,
  productFulfillmentMode,
  serviceAppointmentMode,
  serviceRequestedDate,
  serviceRequestedTime,
  isFormComplete,
  cartFingerprint,
  setError,
  messages,
}: {
  activeStep: 'information' | 'shipping' | 'payment'
  locale: string
  formState: CustomerSnapshot
  items: CartItem[]
  selectedShippingOptionID: string | null
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  serviceAppointmentMode: 'requested_slot' | 'contact_later'
  serviceRequestedDate: string
  serviceRequestedTime: string
  isFormComplete: boolean
  cartFingerprint: string
  setError: (message: string | null) => void
  messages: {
    completeRequiredFields: string
    cartEmptyError: string
    checkoutFailed: string
    unavailableProducts: string
    insufficientAvailability: string
    checkoutResponseInvalid: string
  }
}) => {
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [prefetching, setPrefetching] = useState(false)
  const [expressPrefetchTried, setExpressPrefetchTried] = useState(false)
  const [expressPrefetchError, setExpressPrefetchError] = useState<string | null>(null)

  const createPaymentSession = useCallback(
    async ({
      silent = false,
      allowIncompleteForExpress = false,
    }: {
      silent?: boolean
      allowIncompleteForExpress?: boolean
    } = {}) => {
      if (submitting || prefetching) return
      if (!allowIncompleteForExpress && !isFormComplete) {
        if (!silent) setError(messages.completeRequiredFields)
        return
      }
      if (items.length === 0) {
        if (!silent) setError(messages.cartEmptyError)
        return
      }

      if (silent) {
        setPrefetching(true)
      } else {
        setSubmitting(true)
      }
      if (!silent) setError(null)
      if (silent) setExpressPrefetchError(null)

      try {
        const session = await createPaymentElementSession({
          locale,
          customer: formState,
          items,
          shippingOptionID: selectedShippingOptionID,
          productFulfillmentMode,
          serviceAppointmentMode,
          serviceRequestedDate,
          serviceRequestedTime,
        })

        setPaymentSession(session)
        setExpressPrefetchError(null)
      } catch (err) {
        let message = messages.checkoutFailed

        if (err instanceof CheckoutSessionError) {
          if (err.status === 409 && Array.isArray(err.missing) && err.missing.length > 0) {
            message = messages.unavailableProducts
          } else if (
            err.status === 409 &&
            typeof err.available === 'number' &&
            typeof err.requested === 'number'
          ) {
            message = err.message || messages.insufficientAvailability
          } else if (err.message === 'checkout_response_invalid') {
            message = messages.checkoutResponseInvalid
          } else if (err.message && err.message !== 'checkout_failed') {
            message = err.message
          }
        } else if (err instanceof Error) {
          message = err.message
        }

        if (silent) setExpressPrefetchError(message)
        if (!silent) setError(message)
      } finally {
        if (silent) {
          setPrefetching(false)
        } else {
          setSubmitting(false)
        }
      }
    },
    [
      formState,
      isFormComplete,
      items,
      locale,
      messages.cartEmptyError,
      messages.checkoutFailed,
      messages.checkoutResponseInvalid,
      messages.completeRequiredFields,
      messages.insufficientAvailability,
      messages.unavailableProducts,
      productFulfillmentMode,
      selectedShippingOptionID,
      serviceAppointmentMode,
      serviceRequestedDate,
      serviceRequestedTime,
      setError,
      prefetching,
      submitting,
    ],
  )

  useEffect(() => {
    if (activeStep !== 'information') return
    if (items.length === 0) return
    if (paymentSession || submitting || prefetching || expressPrefetchTried) return

    setExpressPrefetchTried(true)
    void createPaymentSession({ silent: true, allowIncompleteForExpress: true })
  }, [
    activeStep,
    createPaymentSession,
    expressPrefetchTried,
    items.length,
    paymentSession,
    prefetching,
    submitting,
  ])

  useEffect(() => {
    setExpressPrefetchTried(false)
    setExpressPrefetchError(null)
  }, [cartFingerprint, locale])

  useEffect(() => {
    if (activeStep === 'information') {
      setPaymentSession(null)
    }
  }, [activeStep])

  const stripePromise = useMemo(() => {
    if (!paymentSession?.publishableKey) return null
    return loadStripe(paymentSession.publishableKey)
  }, [paymentSession?.publishableKey])

  const stripeOptions = useMemo<StripeElementsOptions | null>(() => {
    const stripeLocale = STRIPE_LOCALE_MAP[locale] ?? 'en'

    return paymentSession
      ? {
          clientSecret: paymentSession.clientSecret,
          locale: stripeLocale,
          appearance: {
            theme: 'flat' as const,
            variables: {
              colorPrimary: 'var(--text-secondary)',
              colorBackground: 'var(--paper)',
              colorText: 'var(--text-primary)',
              colorTextSecondary: 'var(--text-secondary)',
              colorDanger: 'var(--neon-red)',
              borderRadius: '12px',
              spacingUnit: '4px',
              fontFamily: 'Instrument Sans, system-ui, sans-serif',
            },
            rules: {
              '.AccordionItem': {
                border: '1px solid var(--stroke)',
                boxShadow: 'none',
              },
              '.AccordionItem--selected': {
                borderColor: 'var(--text-secondary)',
              },
              '.Input': {
                border: '1px solid var(--stroke)',
                boxShadow: 'none',
              },
              '.Block': {
                border: '1px solid var(--stroke)',
                boxShadow: 'none',
              },
              '.Tab': {
                border: '1px solid var(--stroke)',
                boxShadow: 'none',
              },
              '.Tab--selected': {
                borderColor: 'var(--text-secondary)',
                boxShadow: '0 0 0 1px var(--text-secondary)',
              },
              '.Label': {
                fontWeight: '500',
              },
            },
          },
        }
      : null
  }, [paymentSession, locale])

  const onExpressRetry = () => {
    setExpressPrefetchTried(false)
    setExpressPrefetchError(null)
  }

  return {
    paymentSession,
    submitting,
    createPaymentSession,
    expressPrefetchTried,
    expressPrefetchError,
    onExpressRetry,
    stripePromise,
    stripeOptions,
  }
}
