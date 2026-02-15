'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AddressElement, Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import type { StripeElementLocale } from '@stripe/stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'

import styles from '@/app/(checkout)/[locale]/checkout/checkout.module.css'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  readCart,
  writeCart,
  type CartItem,
} from '@/lib/cartStorage'

const formatPrice = (value: number, currency?: string) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

type PaymentSession = {
  clientSecret: string
  publishableKey: string
  orderNumber?: string
  orderId?: string | number
}

type RecommendedProduct = {
  id: string
  title: string
  price: number | null
  currency: string
  format: string
  coverImage: string | null
  lineName: string
  brandName: string
}

type CustomerSnapshot = {
  email: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  province: string
  phone: string
}

function PaymentElementForm({
  locale,
  paymentSession,
  customer,
  copy,
  onBack,
  onError,
  onSuccess,
}: {
  locale: string
  paymentSession: PaymentSession
  customer: CustomerSnapshot
  copy: ReturnType<typeof getJourneyDictionary>['checkout']
  onBack: () => void
  onError: (message: string) => void
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [confirming, setConfirming] = useState(false)
  const [billingMode, setBillingMode] = useState<'same' | 'different'>('same')

  const handlePay = async () => {
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
          ...(billingMode === 'same'
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
        onError(error.message || copy.messages.paymentFailedRetry)
        return
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        onSuccess()
        return
      }

      onError(copy.messages.paymentIncomplete)
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
        <h3 className={styles.billingTitle}>{copy.sections.billingAddress}</h3>
        <p className={styles.paymentDescription}>{copy.messages.billingAddressDescription}</p>
        <div className={styles.billingChoiceCard}>
          <button
            type="button"
            className={`${styles.paymentMethodRow} ${billingMode === 'same' ? styles.paymentMethodRowActive : ''}`}
            onClick={() => setBillingMode('same')}
          >
            <span className={styles.radioDot} aria-hidden />
            <span>{copy.messages.sameAsShipping}</span>
          </button>
          <button
            type="button"
            className={`${styles.paymentMethodRow} ${billingMode === 'different' ? styles.paymentMethodRowActive : ''}`}
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
        <button type="button" className={styles.returnLinkButton} onClick={onBack} disabled={confirming}>
          <span className={styles.returnIcon}>‹</span>
          {copy.actions.returnToShipping}
        </button>
        <button className={styles.continueButton} type="button" onClick={handlePay} disabled={confirming}>
          {confirming ? copy.actions.processing : copy.actions.payNow}
        </button>
      </div>
    </>
  )
}

export function CheckoutClient({ notice, locale }: { notice?: string | null; locale: string }) {
  type ShippingOption = {
    id: string
    name: string
    amount: number
    currency: string
    deliveryEstimate: string
  }

  const router = useRouter()
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).checkout
  const [activeStep, setActiveStep] = useState<'information' | 'shipping' | 'payment'>('information')
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [formState, setFormState] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingAmount, setShippingAmount] = useState<number | null>(null)
  const [shippingCurrency, setShippingCurrency] = useState('EUR')
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingOptionID, setSelectedShippingOptionID] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(false)

  useEffect(() => {
    const syncCart = () => {
      setItems(readCart())
    }

    syncCart()
    window.addEventListener(CART_UPDATED_EVENT, syncCart)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart)
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) {
      setRecommended([])
      setRecommendedLoading(false)
      return
    }

    const seedId = Number(items[0]?.id)
    if (!Number.isFinite(seedId)) {
      setRecommended([])
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      productId: String(seedId),
      locale,
      limit: '2',
      exclude: items.map((item) => item.id).join(','),
    })

    const run = async () => {
      try {
        setRecommendedLoading(true)
        const response = await fetch(`/api/shop/recommendations?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as { ok?: boolean; docs?: RecommendedProduct[] }
        if (!response.ok || !data.ok || !Array.isArray(data.docs)) {
          setRecommended([])
          return
        }
        setRecommended(data.docs.slice(0, 2))
      } catch {
        if (!controller.signal.aborted) {
          setRecommended([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setRecommendedLoading(false)
        }
      }
    }

    void run()
    return () => controller.abort()
  }, [items, locale])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [items],
  )

  const addRecommendedToCart = (product: RecommendedProduct) => {
    const next = [...items]
    const existingIndex = next.findIndex((item) => item.id === product.id)
    if (existingIndex >= 0) {
      const existing = next[existingIndex]
      next[existingIndex] = {
        ...existing,
        quantity: existing.quantity + 1,
      }
    } else {
      next.push({
        id: product.id,
        title: product.title,
        price: typeof product.price === 'number' ? product.price : undefined,
        currency: product.currency || 'EUR',
        brand: product.brandName || product.lineName || undefined,
        coverImage: product.coverImage || null,
        quantity: 1,
      })
    }
    writeCart(next)
    emitCartUpdated()
  }

  const isFormComplete = useMemo(() => {
    const required = [
      formState.email,
      formState.firstName,
      formState.lastName,
      formState.address,
      formState.postalCode,
      formState.city,
      formState.province,
    ]
    return required.every((value) => value.trim().length > 0)
  }, [formState])

  const shippingLabel = useMemo(() => {
    if (shippingLoading) return copy.messages.shippingCalculating
    const selected = shippingOptions.find((option) => option.id === selectedShippingOptionID) || null
    if (selected) return formatPrice(selected.amount, selected.currency)
    if (typeof shippingAmount === 'number') return formatPrice(shippingAmount, shippingCurrency)
    return copy.messages.shippingCalculatedNextStep
  }, [copy.messages.shippingCalculatedNextStep, copy.messages.shippingCalculating, shippingAmount, shippingCurrency, shippingLoading, shippingOptions, selectedShippingOptionID])
  const selectedShippingOption = useMemo(
    () => shippingOptions.find((option) => option.id === selectedShippingOptionID) || null,
    [shippingOptions, selectedShippingOptionID],
  )
  const effectiveShippingAmount = selectedShippingOption
    ? selectedShippingOption.amount
    : typeof shippingAmount === 'number'
      ? shippingAmount
      : 0
  const effectiveShippingCurrency = selectedShippingOption
    ? selectedShippingOption.currency
    : shippingCurrency
  const totalAmount = subtotal + effectiveShippingAmount

  const shippingNoticeBlocks = useMemo(() => {
    const normalized = (notice ?? '').trim()
    if (!normalized) return []
    return normalized
      .split(/\n\s*\n/g)
      .map((block) => block.trim())
      .filter((block) => block.length > 0)
  }, [notice])

  const shippingAddressLabel = useMemo(() => {
    return [formState.address, `${formState.postalCode} ${formState.city} ${formState.province}`.trim(), copy.country]
      .filter((value) => value.trim().length > 0)
      .join(', ')
  }, [copy.country, formState.address, formState.postalCode, formState.city, formState.province])

  const isShippingAddressComplete = useMemo(() => {
    const required = [formState.address, formState.postalCode, formState.city, formState.province]
    return required.every((value) => value.trim().length > 0)
  }, [formState.address, formState.postalCode, formState.city, formState.province])

  useEffect(() => {
    if (!isShippingAddressComplete || items.length === 0) {
      setShippingAmount(null)
      setShippingLoading(false)
      setShippingOptions([])
      setSelectedShippingOptionID(null)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setShippingLoading(true)
        const response = await fetch('/api/shop/shipping-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            address: formState.address,
            city: formState.city,
            province: formState.province,
            postalCode: formState.postalCode,
            country: 'IT',
            subtotal,
          }),
        })

        const data = (await response.json()) as {
          ok?: boolean
          amount?: number | null
          currency?: string
          methods?: ShippingOption[]
        }
        if (!response.ok || !data.ok) {
          setShippingAmount(null)
          setShippingOptions([])
          setSelectedShippingOptionID(null)
          return
        }

        if (typeof data.amount === 'number' && Number.isFinite(data.amount)) {
          setShippingAmount(data.amount)
          setShippingCurrency(typeof data.currency === 'string' ? data.currency : 'EUR')
        } else {
          setShippingAmount(null)
        }

        const methods = Array.isArray(data.methods)
          ? data.methods.filter(
              (method): method is ShippingOption =>
                typeof method?.id === 'string' &&
                typeof method?.name === 'string' &&
                typeof method?.amount === 'number' &&
                Number.isFinite(method.amount),
            )
          : []
        setShippingOptions(methods)
        setSelectedShippingOptionID((previous) => {
          if (previous && methods.some((method) => method.id === previous)) return previous
          return methods[0]?.id ?? null
        })
      } catch {
        if (!controller.signal.aborted) {
          setShippingAmount(null)
          setShippingOptions([])
          setSelectedShippingOptionID(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setShippingLoading(false)
        }
      }
    }, 400)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [
    formState.address,
    formState.city,
    formState.postalCode,
    formState.province,
    isShippingAddressComplete,
    items.length,
    subtotal,
  ])

  const createPaymentSession = async () => {
    if (submitting) return
    if (!isFormComplete) {
      setError(copy.messages.completeRequiredFields)
      return
    }
    if (items.length === 0) {
      setError(copy.messages.cartEmptyError)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutMode: 'payment_element',
          locale,
          customer: formState,
          items: items.map((item: CartItem) => ({ id: item.id, quantity: item.quantity })),
          shippingOptionID: selectedShippingOptionID,
        }),
      })

      const data = (await response.json()) as {
        error?: string
        orderNumber?: string
        orderId?: string | number
        checkoutUrl?: string | null
        paymentIntentClientSecret?: string | null
        stripePublishableKey?: string | null
        checkoutMode?: 'redirect' | 'payment_element'
        missing?: string[]
        productId?: string
        requested?: number
        available?: number
      }
      if (!response.ok) {
        if (response.status === 409) {
          if (Array.isArray(data.missing) && data.missing.length > 0) {
            throw new Error(copy.messages.unavailableProducts)
          }
          if (typeof data.available === 'number' && typeof data.requested === 'number') {
            throw new Error(data.error || copy.messages.insufficientAvailability)
          }
        }
        throw new Error(data.error || copy.messages.checkoutFailed)
      }

      if (
        data.checkoutMode === 'payment_element' &&
        typeof data.paymentIntentClientSecret === 'string' &&
        data.paymentIntentClientSecret.length > 0 &&
        typeof data.stripePublishableKey === 'string' &&
        data.stripePublishableKey.length > 0
      ) {
        setPaymentSession({
          clientSecret: data.paymentIntentClientSecret,
          publishableKey: data.stripePublishableKey,
          orderNumber: data.orderNumber,
          orderId: data.orderId,
        })
        return
      }

      if (data.checkoutMode === 'payment_element') {
        throw new Error(copy.messages.paymentConfigIncomplete)
      }

      throw new Error(copy.messages.checkoutResponseInvalid)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.messages.checkoutFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const onGoToShippingStep = () => {
    if (!isFormComplete) {
      setError(copy.messages.completeRequiredFields)
      return
    }
    if (items.length === 0) {
      setError(copy.messages.cartEmptyError)
      return
    }
    setError(null)
    setActiveStep('shipping')
  }

  const onBackToInformationStep = () => {
    setActiveStep('information')
  }

  const onGoToPaymentStep = () => {
    if (items.length === 0) {
      setError(copy.messages.cartEmptyError)
      return
    }
    if (submitting) return

    setError(null)
    setActiveStep('payment')
    if (!paymentSession) {
      void createPaymentSession()
    }
  }

  const onBackToShippingStep = () => {
    setActiveStep('shipping')
  }

  const stripePromise = useMemo(() => {
    if (!paymentSession?.publishableKey) return null
    return loadStripe(paymentSession.publishableKey)
  }, [paymentSession?.publishableKey])

  const stripeOptions = useMemo<StripeElementsOptions | null>(
    () => {
      const stripeLocaleMap: Record<string, StripeElementLocale> = {
        it: 'it',
        en: 'en',
        ru: 'ru',
      }
      const stripeLocale = stripeLocaleMap[resolvedLocale] ?? 'en'
      return paymentSession
        ? {
            clientSecret: paymentSession.clientSecret,
            locale: stripeLocale,
            appearance: {
              theme: 'flat' as const,
              variables: {
                colorPrimary: '#6a6660',
                colorBackground: '#ffffff',
                colorText: '#1f1c19',
                colorTextSecondary: '#726d67',
                colorDanger: '#b42318',
                borderRadius: '12px',
                spacingUnit: '4px',
                fontFamily: 'Instrument Sans, system-ui, sans-serif',
              },
              rules: {
                '.AccordionItem': {
                  border: '1px solid #a39d95',
                  boxShadow: 'none',
                },
                '.AccordionItem--selected': {
                  borderColor: '#6a6660',
                },
                '.Input': {
                  border: '1px solid #c8c3bd',
                  boxShadow: 'none',
                },
                '.Block': {
                  border: '1px solid #c8c3bd',
                  boxShadow: 'none',
                },
                '.Tab': {
                  border: '1px solid #a39d95',
                  boxShadow: 'none',
                },
                '.Tab--selected': {
                  borderColor: '#6a6660',
                  boxShadow: '0 0 0 1px #6a6660',
                },
                '.Label': {
                  fontWeight: '500',
                },
              },
            },
          }
        : null
    },
    [paymentSession, resolvedLocale],
  )

  const onPaymentComplete = () => {
    writeCart([])
    emitCartUpdated()
    const orderCode = paymentSession?.orderNumber || String(paymentSession?.orderId || '')
    router.push(`/${locale}/checkout/success${orderCode ? `?order=${encodeURIComponent(orderCode)}` : ''}`)
  }

  useEffect(() => {
    if (activeStep === 'information') {
      setPaymentSession(null)
    }
  }, [
    activeStep,
    formState.email,
    formState.firstName,
    formState.lastName,
    formState.address,
    formState.postalCode,
    formState.city,
    formState.province,
    formState.phone,
    selectedShippingOptionID,
  ])

  return (
    <div className={styles.page}>
      <section className={styles.form}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>dob</h1>
          <div className={styles.steps}>
            <span className={styles.stepItem}>{copy.stepper.cart}</span>
            <span className={styles.stepSeparator}>›</span>
            <span
              className={`${styles.stepItem} ${activeStep === 'information' ? styles.stepItemActive : styles.stepItemDone}`}
            >
              {copy.stepper.information}
            </span>
            <span className={styles.stepSeparator}>›</span>
            <span
              className={`${styles.stepItem} ${activeStep === 'shipping' ? styles.stepItemActive : activeStep === 'payment' ? styles.stepItemDone : ''}`}
            >
              {copy.stepper.shipping}
            </span>
            <span className={styles.stepSeparator}>›</span>
            <span className={`${styles.stepItem} ${activeStep === 'payment' ? styles.stepItemActive : ''}`}>
              {copy.stepper.payment}
            </span>
          </div>
        </div>

        {error ? <div className={styles.notice}>{error}</div> : null}

        {activeStep === 'information' ? (
          <>
            <section className={styles.express}>
              <p className={styles.expressTitle}>{copy.expressCheckout}</p>
              <div className={styles.expressRow}>
                <button
                  type="button"
                  className={styles.expressButton}
                  onClick={onGoToPaymentStep}
                  disabled={submitting}
                >
                  Shop Pay
                </button>
                <button
                  type="button"
                  className={styles.expressButton}
                  onClick={onGoToPaymentStep}
                  disabled={submitting}
                >
                  PayPal
                </button>
                <button
                  type="button"
                  className={styles.expressButton}
                  onClick={onGoToPaymentStep}
                  disabled={submitting}
                >
                  GPay
                </button>
              </div>
              <div className={styles.orDivider}>{copy.orDivider}</div>
            </section>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <span>{copy.contact}</span>
              </div>
              <input
                className={styles.input}
                placeholder={copy.placeholders.email}
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <span>{copy.shippingAddress}</span>
              </div>
              <select className={styles.select} defaultValue={copy.country}>
                <option value={copy.country}>{copy.country}</option>
              </select>
              <div className={styles.splitRow}>
                <input
                  className={styles.input}
                  placeholder={copy.placeholders.firstName}
                  value={formState.firstName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
                <input
                  className={styles.input}
                  placeholder={copy.placeholders.lastName}
                  value={formState.lastName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
              </div>
              <input
                className={styles.input}
                placeholder={copy.placeholders.address}
                value={formState.address}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, address: event.target.value }))
                }
              />
              <div className={styles.splitRowThree}>
                <input
                  className={styles.input}
                  placeholder={copy.placeholders.postalCode}
                  value={formState.postalCode}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                />
                <input
                  className={styles.input}
                  placeholder={copy.placeholders.city}
                  value={formState.city}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
                <input
                  className={styles.input}
                  placeholder={copy.placeholders.province}
                  value={formState.province}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, province: event.target.value }))
                  }
                />
              </div>
              <input
                className={styles.input}
                placeholder={copy.placeholders.phoneOptional}
                value={formState.phone}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>

            <div className={styles.actionsRow}>
              <Link className={styles.returnLink} href={`/${locale}/cart`}>
                <span className={styles.returnIcon}>‹</span>
                {copy.actions.returnToCart}
              </Link>
              <button
                className={styles.continueButton}
                type="button"
                disabled={submitting}
                onClick={onGoToShippingStep}
              >
                {copy.actions.goToShipping}
              </button>
            </div>
          </>
        ) : activeStep === 'shipping' ? (
          <>
            <section className={styles.shippingSummaryCard}>
              <div className={styles.shippingSummaryRow}>
                <span className={styles.shippingSummaryLabel}>{copy.contact}</span>
                <span className={styles.shippingSummaryValue}>{formState.email || '—'}</span>
                <button type="button" className={styles.changeLink} onClick={onBackToInformationStep}>
                  {copy.actions.change}
                </button>
              </div>
              <div className={styles.shippingSummaryDivider} />
              <div className={styles.shippingSummaryRow}>
                <span className={styles.shippingSummaryLabel}>{copy.shippingAddress}</span>
                <span className={styles.shippingSummaryValue}>{shippingAddressLabel || '—'}</span>
                <button type="button" className={styles.changeLink} onClick={onBackToInformationStep}>
                  {copy.actions.change}
                </button>
              </div>
            </section>

            <section className={styles.shippingMethodSection}>
              <h2 className={styles.shippingMethodTitle}>{copy.sections.shippingMethod}</h2>
              <div className={styles.shippingMethodCard}>
                {shippingLoading ? (
                  <p className={styles.shippingMethodEta}>{copy.messages.shippingLoadingMethods}</p>
                ) : shippingOptions.length === 0 ? (
                  <p className={styles.shippingMethodEta}>{copy.messages.shippingNoMethods}</p>
                ) : (
                  <div className={styles.shippingMethodList}>
                    {shippingOptions.map((option) => {
                      const isActive = option.id === selectedShippingOptionID
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`${styles.shippingMethodOption} ${isActive ? styles.shippingMethodOptionActive : ''}`}
                          onClick={() => setSelectedShippingOptionID(option.id)}
                        >
                          <div>
                            <p className={styles.shippingMethodName}>{option.name}</p>
                            {option.deliveryEstimate ? (
                              <p className={styles.shippingMethodEta}>{option.deliveryEstimate}</p>
                            ) : null}
                          </div>
                          <strong className={styles.shippingMethodPrice}>
                            {formatPrice(option.amount, option.currency)}
                          </strong>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            {shippingNoticeBlocks.length > 0 ? (
              <div className={styles.shippingNote}>
                {shippingNoticeBlocks.map((block, index) => (
                  <p key={`${block}-${index}`}>{block}</p>
                ))}
              </div>
            ) : null}

            <div className={styles.actionsRow}>
              <button type="button" className={styles.returnLinkButton} onClick={onBackToInformationStep}>
                <span className={styles.returnIcon}>‹</span>
                {copy.actions.returnToInformation}
              </button>
              <button
                className={styles.continueButton}
                type="button"
                disabled={submitting}
                onClick={onGoToPaymentStep}
              >
                {copy.actions.continueToPayment}
              </button>
            </div>
          </>
        ) : (
          <>
            <section className={styles.shippingSummaryCard}>
              <div className={styles.shippingSummaryRow}>
                <span className={styles.shippingSummaryLabel}>{copy.contact}</span>
                <span className={styles.shippingSummaryValue}>{formState.email || '—'}</span>
                <button type="button" className={styles.changeLink} onClick={onBackToInformationStep}>
                  {copy.actions.change}
                </button>
              </div>
              <div className={styles.shippingSummaryDivider} />
              <div className={styles.shippingSummaryRow}>
                <span className={styles.shippingSummaryLabel}>{copy.shippingAddress}</span>
                <span className={styles.shippingSummaryValue}>{shippingAddressLabel || '—'}</span>
                <button type="button" className={styles.changeLink} onClick={onBackToInformationStep}>
                  {copy.actions.change}
                </button>
              </div>
              <div className={styles.shippingSummaryDivider} />
              <div className={styles.shippingSummaryRow}>
                <span className={styles.shippingSummaryLabel}>{copy.sections.shippingMethod}</span>
                <span className={styles.shippingSummaryValue}>
                  {selectedShippingOption
                    ? `${selectedShippingOption.name} · ${formatPrice(
                        selectedShippingOption.amount,
                        selectedShippingOption.currency,
                      )}`
                    : shippingLabel}
                </span>
                <button type="button" className={styles.changeLink} onClick={onBackToShippingStep}>
                  {copy.actions.change}
                </button>
              </div>
            </section>

            <section className={styles.paymentSection}>
              <h2 className={styles.paymentTitle}>{copy.sections.payment}</h2>
              <p className={styles.paymentDescription}>{copy.messages.secureTransactions}</p>
              {!paymentSession && submitting ? (
                <div className={styles.paymentLoading}>{copy.messages.loadingPaymentElement}</div>
              ) : null}
              {paymentSession && stripePromise && stripeOptions ? (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <PaymentElementForm
                    locale={locale}
                    paymentSession={paymentSession}
                    customer={formState}
                    copy={copy}
                    onBack={onBackToShippingStep}
                    onError={(message) => setError(message || null)}
                    onSuccess={onPaymentComplete}
                  />
                </Elements>
              ) : null}
              {!paymentSession && !submitting && error ? (
                <div className={styles.paymentLoadingError}>
                  {copy.messages.paymentElementLoadErrorPrefix} {error}
                </div>
              ) : null}
            </section>
          </>
        )}

        <div className={styles.footerLinks}>
          <Link href={`/${locale}/refund`} className={styles.footerLink}>
            {copy.footer.refundPolicy}
          </Link>
          <Link href={`/${locale}/shipping`} className={styles.footerLink}>
            {copy.footer.shipping}
          </Link>
          <Link href={`/${locale}/privacy`} className={styles.footerLink}>
            {copy.footer.privacyPolicy}
          </Link>
          <Link href={`/${locale}/terms`} className={styles.footerLink}>
            {copy.footer.termsOfService}
          </Link>
          <Link href={`/${locale}/contact`} className={styles.footerLink}>
            {copy.footer.contact}
          </Link>
        </div>
      </section>

      <aside className={styles.summary}>
        {items.length === 0 ? (
          <div className={styles.summaryMeta}>{copy.messages.cartEmpty}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.summaryItem}>
              <div className={styles.summaryThumb}>
                <span className={styles.summaryQtyBadge}>{item.quantity}</span>
                {normalizeThumbnailSrc(item.coverImage) ? (
                  <Image
                    src={normalizeThumbnailSrc(item.coverImage) || ''}
                    alt={item.title}
                    fill
                    className="object-contain"
                    unoptimized={isRemoteThumbnailSrc(item.coverImage)}
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div>
                <p className={styles.summaryTitle}>{item.title}</p>
                <div className={styles.summaryMeta}>{item.brand || copy.messages.defaultProductLabel}</div>
              </div>
              <div className={styles.summaryPrice}>
                {typeof item.price === 'number'
                  ? formatPrice(item.price * item.quantity, item.currency)
                  : '—'}
              </div>
            </div>
          ))
        )}

        <div className={styles.codeRow}>
          <input className={styles.input} placeholder={copy.placeholders.discountCode} />
          <button type="button" className={styles.applyButton}>
            {copy.actions.apply}
          </button>
        </div>

        <div className={styles.summaryRow}>
          <span>{copy.summary.subtotal}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>{copy.summary.shipping}</span>
          <span className={styles.summaryMeta}>{shippingLabel}</span>
        </div>
        <div className={styles.totalRow}>
          <span>{copy.summary.total}</span>
          <span>{formatPrice(totalAmount, effectiveShippingCurrency)}</span>
        </div>
        <p className={styles.summaryTaxNote}>{copy.messages.includingTaxes}</p>

        <h3 className={styles.summaryRecoTitle}>{copy.sections.recommendations}</h3>
        <div className={styles.summaryRecoList}>
          {recommendedLoading ? (
            <p className={styles.summaryMeta}>{copy.messages.loadingRecommendations}</p>
          ) : recommended.length === 0 ? (
            <p className={styles.summaryMeta}>{copy.messages.noRecommendations}</p>
          ) : (
            recommended.map((product) => (
              <div key={product.id} className={styles.summaryRecoItem}>
                <div className={styles.summaryRecoThumb}>
                  {normalizeThumbnailSrc(product.coverImage) ? (
                    <Image
                      src={normalizeThumbnailSrc(product.coverImage) || ''}
                      alt={product.title}
                      fill
                      className="object-contain"
                      unoptimized={isRemoteThumbnailSrc(product.coverImage)}
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className={styles.summaryRecoContent}>
                  <p className={styles.summaryRecoName}>{product.title}</p>
                  {product.format ? <p className={styles.summaryRecoFormat}>{product.format}</p> : null}
                  {typeof product.price === 'number' ? (
                    <p className={styles.summaryRecoPrice}>{formatPrice(product.price, product.currency)}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={styles.summaryRecoAction}
                  onClick={() => addRecommendedToCart(product)}
                >
                  {copy.actions.add}
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
