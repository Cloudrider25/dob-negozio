'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'

import { createPaymentElementSession, CheckoutSessionError } from '@/frontend/page-domains/checkout/client-api/paymentSession'
import type { CustomerSnapshot, PaymentSession } from '@/frontend/page-domains/checkout/shared/contracts'
import { STRIPE_LOCALE_MAP } from '@/frontend/page-domains/checkout/shared/contracts'
import type { CartItem } from '@/lib/frontend/cart/storage'

const resolveCssColor = (varName: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback
  const fromBody = document.body
    ? getComputedStyle(document.body).getPropertyValue(varName).trim()
    : ''
  if (fromBody) return fromBody
  const fromRoot = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return fromRoot || fallback
}

const toStripeColor = (value: string, fallback: string) => {
  const input = (value || '').trim()
  if (!input) return fallback

  if (input.startsWith('#') || input.startsWith('rgb(') || input.startsWith('hsl(')) {
    return input
  }

  const rgbaMatch = input.match(
    /^rgba\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[,/]\s*([0-9.]+)\s*\)$/i,
  )
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch
    return `rgb(${r}, ${g}, ${b})`
  }

  return fallback
}

const detectThemeMode = (): 'dark' | 'light' => {
  if (typeof document === 'undefined') return 'dark'
  const bodyTheme = document.body?.getAttribute('data-theme')
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  const classes = `${document.body?.className || ''} ${document.documentElement.className || ''}`.toLowerCase()
  if (bodyTheme === 'light' || htmlTheme === 'light') return 'light'
  if (bodyTheme === 'dark' || htmlTheme === 'dark') return 'dark'
  if (classes.includes('light')) return 'light'
  if (classes.includes('dark')) return 'dark'
  return 'dark'
}

export const useCheckoutPaymentSession = ({
  activeStep,
  locale,
  formState,
  items,
  selectedShippingOptionID,
  discountCode,
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
  discountCode?: string | null
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
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const inFlightRef = useRef(false)

  const createPaymentSession = useCallback(
    async ({
      silent = false,
      allowIncompleteForExpress = false,
      overrideDiscountCode,
    }: {
      silent?: boolean
      allowIncompleteForExpress?: boolean
      overrideDiscountCode?: string | null
    } = {}) => {
      if (inFlightRef.current || submitting || prefetching) return
      if (!allowIncompleteForExpress && !isFormComplete) {
        if (!silent) setError(messages.completeRequiredFields)
        return
      }
      if (items.length === 0) {
        if (!silent) setError(messages.cartEmptyError)
        return
      }

      inFlightRef.current = true
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
          discountCode: overrideDiscountCode ?? discountCode,
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
        inFlightRef.current = false
      }
    },
    [
      formState,
      isFormComplete,
      items,
      locale,
      discountCode,
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
    setExpressPrefetchTried(false)
    setExpressPrefetchError(null)
    setPaymentSession(null)
  }, [cartFingerprint, locale, discountCode])

  useEffect(() => {
    if (activeStep === 'information') {
      setPaymentSession(null)
    }
  }, [activeStep])

  useEffect(() => {
    if (activeStep !== 'information') return
    if (expressPrefetchTried) return

    setExpressPrefetchTried(true)
    void createPaymentSession({ silent: true, allowIncompleteForExpress: true })
  }, [activeStep, createPaymentSession, expressPrefetchTried])

  useEffect(() => {
    const syncTheme = () => setThemeMode(detectThemeMode())
    syncTheme()

    if (typeof MutationObserver === 'undefined') return

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      })
    }
    return () => observer.disconnect()
  }, [])

  const stripePromise = useMemo(() => {
    if (!paymentSession?.publishableKey) return null
    return loadStripe(paymentSession.publishableKey)
  }, [paymentSession?.publishableKey])

  const stripeOptions = useMemo<StripeElementsOptions | null>(() => {
    const stripeLocale = STRIPE_LOCALE_MAP[locale] ?? 'en'
    const colorPrimary = toStripeColor(resolveCssColor('--text-secondary', '#b3b3b3'), '#b3b3b3')
    const colorBackground = toStripeColor(resolveCssColor('--paper', '#2d2d2e'), '#2d2d2e')
    const colorText = toStripeColor(resolveCssColor('--text-primary', '#f6f2ea'), '#f6f2ea')
    const colorTextSecondary = toStripeColor(
      resolveCssColor('--text-secondary', '#b3b3b3'),
      '#b3b3b3',
    )
    const colorDanger = toStripeColor(resolveCssColor('--neon-red', '#ff2d2d'), '#ff2d2d')
    const colorBorder = resolveCssColor('--stroke', 'rgba(255, 255, 255, 0.1)')

    return paymentSession
      ? {
          clientSecret: paymentSession.clientSecret,
          locale: stripeLocale,
          appearance: {
            theme: themeMode === 'dark' ? ('night' as const) : ('stripe' as const),
            variables: {
              colorPrimary,
              colorBackground,
              colorText,
              colorTextSecondary,
              colorDanger,
              borderRadius: '12px',
              spacingUnit: '4px',
              fontFamily: 'Instrument Sans, system-ui, sans-serif',
            },
            rules: {
              '.AccordionItem': {
                border: `1px solid ${colorBorder}`,
                boxShadow: 'none',
              },
              '.AccordionItem--selected': {
                borderColor: colorTextSecondary,
              },
              '.Input': {
                border: `1px solid ${colorBorder}`,
                boxShadow: 'none',
              },
              '.Block': {
                border: `1px solid ${colorBorder}`,
                boxShadow: 'none',
              },
              '.Tab': {
                border: `1px solid ${colorBorder}`,
                boxShadow: 'none',
              },
              '.Tab--selected': {
                borderColor: colorTextSecondary,
                boxShadow: `0 0 0 1px ${colorTextSecondary}`,
              },
              '.Label': {
                fontWeight: '500',
              },
            },
          },
        }
      : null
  }, [paymentSession, locale, themeMode])

  const onExpressRetry = () => {
    setExpressPrefetchTried(false)
    setExpressPrefetchError(null)
    setPaymentSession(null)
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
