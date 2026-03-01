'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import styles from '@/components/checkout/CheckoutClient.module.css'
import { cn } from '@/lib/cn'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { useCheckoutRecommendations } from './hooks/useCheckoutRecommendations'
import { useCheckoutPaymentSession } from './hooks/useCheckoutPaymentSession'
import { useCheckoutStepActions } from './hooks/useCheckoutStepActions'
import { useDesktopViewport } from './hooks/useDesktopViewport'
import { useShippingQuote } from './hooks/useShippingQuote'
import {
  type CustomerSnapshot,
  type CheckoutStep,
  isServiceCartItem,
  type RecommendedProduct,
} from './shared/contracts'
import { formatPrice } from './shared/format'
import { CheckoutFooterLinks } from './ui/CheckoutFooterLinks'
import { CheckoutOrderSummary } from './ui/CheckoutOrderSummary'
import { CheckoutStepHeader } from './ui/CheckoutStepHeader'
import { InformationStep } from './ui/steps/InformationStep'
import { PaymentStep } from './ui/steps/PaymentStep'
import { ShippingStep } from './ui/steps/ShippingStep'
import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  readCart,
  writeCart,
  type CartItem,
} from '@/lib/cartStorage'

export function CheckoutClient({ notice, locale }: { notice?: string | null; locale: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).checkout
  const [activeStep, setActiveStep] = useState<CheckoutStep>('information')
  const [formState, setFormState] = useState<CustomerSnapshot>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [productFulfillmentMode, setProductFulfillmentMode] = useState<'shipping' | 'pickup' | 'none'>(
    'shipping',
  )
  const [serviceAppointmentMode, setServiceAppointmentMode] = useState<'requested_slot' | 'contact_later'>(
    'contact_later',
  )
  const [serviceRequestedDate, setServiceRequestedDate] = useState('')
  const [serviceRequestedTime, setServiceRequestedTime] = useState('')
  const [items, setItems] = useState<CartItem[]>([])
  const isDesktopViewport = useDesktopViewport()

  useEffect(() => {
    const forcedStep = searchParams.get('e2eStep')
    if (forcedStep !== 'information' && forcedStep !== 'shipping' && forcedStep !== 'payment') return
    setActiveStep(forcedStep)
  }, [searchParams])

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

  const { recommended, recommendedLoading } = useCheckoutRecommendations({
    items,
    locale: resolvedLocale,
  })

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [items],
  )
  const hasProducts = useMemo(() => items.some((item) => !isServiceCartItem(item)), [items])
  const hasServices = useMemo(() => items.some((item) => isServiceCartItem(item)), [items])
  const productSubtotal = useMemo(
    () => items.reduce((sum, item) => (isServiceCartItem(item) ? sum : sum + (item.price ?? 0) * item.quantity), 0),
    [items],
  )
  const requiresShippingAddress = hasProducts && productFulfillmentMode === 'shipping'
  const shippingDisabled = !hasProducts || productFulfillmentMode !== 'shipping'

  useEffect(() => {
    if (!hasProducts) {
      setProductFulfillmentMode('none')
      return
    }
    setProductFulfillmentMode((prev) => (prev === 'none' ? 'shipping' : prev))
  }, [hasProducts])

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

  const isContactComplete = useMemo(() => {
    const required = [formState.email, formState.firstName, formState.lastName]
    return required.every((value) => value.trim().length > 0)
  }, [formState.email, formState.firstName, formState.lastName])

  const cartFingerprint = useMemo(
    () => items.map((item) => `${item.id}:${item.quantity}`).join('|'),
    [items],
  )

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
  const isServiceAppointmentComplete = useMemo(() => {
    if (!hasServices) return true
    if (serviceAppointmentMode === 'contact_later') return true
    return serviceRequestedDate.trim().length > 0 && serviceRequestedTime.trim().length > 0
  }, [hasServices, serviceAppointmentMode, serviceRequestedDate, serviceRequestedTime])

  const isFormComplete = useMemo(() => {
    return (
      isContactComplete &&
      (!requiresShippingAddress || isShippingAddressComplete) &&
      isServiceAppointmentComplete
    )
  }, [isContactComplete, isShippingAddressComplete, requiresShippingAddress, isServiceAppointmentComplete])

  const {
    shippingAmount,
    shippingCurrency,
    shippingLoading,
    shippingOptions,
    selectedShippingOptionID,
    setSelectedShippingOptionID,
  } = useShippingQuote({
    formState,
    requiresShippingAddress,
    isShippingAddressComplete,
    itemsCount: items.length,
    productSubtotal,
  })

  const shippingLabel = useMemo(() => {
    if (!hasProducts) return 'Nessuna spedizione (solo servizi)'
    if (productFulfillmentMode === 'pickup') return 'Ritiro in negozio'
    if (shippingLoading) return copy.messages.shippingCalculating
    const selected = shippingOptions.find((option) => option.id === selectedShippingOptionID) || null
    if (selected) return formatPrice(selected.amount, selected.currency)
    if (typeof shippingAmount === 'number') return formatPrice(shippingAmount, shippingCurrency)
    return copy.messages.shippingCalculatedNextStep
  }, [
    copy.messages.shippingCalculatedNextStep,
    copy.messages.shippingCalculating,
    hasProducts,
    productFulfillmentMode,
    shippingAmount,
    shippingCurrency,
    shippingLoading,
    shippingOptions,
    selectedShippingOptionID,
  ])
  const selectedShippingOption = useMemo(
    () => shippingOptions.find((option) => option.id === selectedShippingOptionID) || null,
    [shippingOptions, selectedShippingOptionID],
  )
  const effectiveShippingAmount = shippingDisabled
    ? 0
    : selectedShippingOption
      ? selectedShippingOption.amount
      : typeof shippingAmount === 'number'
        ? shippingAmount
        : 0
  const effectiveShippingCurrency = selectedShippingOption ? selectedShippingOption.currency : shippingCurrency
  const totalAmount = subtotal + effectiveShippingAmount

  const {
    paymentSession,
    submitting,
    createPaymentSession,
    expressPrefetchTried,
    expressPrefetchError,
    onExpressRetry,
    stripePromise,
    stripeOptions,
  } = useCheckoutPaymentSession({
    activeStep,
    locale: resolvedLocale,
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
    messages: {
      completeRequiredFields: copy.messages.completeRequiredFields,
      cartEmptyError: copy.messages.cartEmptyError,
      checkoutFailed: copy.messages.checkoutFailed,
      unavailableProducts: copy.messages.unavailableProducts,
      insufficientAvailability: copy.messages.insufficientAvailability,
      checkoutResponseInvalid: copy.messages.checkoutResponseInvalid,
    },
  })

  const { onGoToShippingStep, onBackToInformationStep, onGoToPaymentStep, onBackToShippingStep } =
    useCheckoutStepActions({
      activeStep,
      setActiveStep,
      isFormComplete,
      itemsCount: items.length,
      submitting,
      paymentSession,
      createPaymentSession: async () => createPaymentSession(),
      setError,
      completeRequiredFieldsMessage: copy.messages.completeRequiredFields,
      cartEmptyErrorMessage: copy.messages.cartEmptyError,
    })

  const onPaymentComplete = async (paymentIntentId?: string) => {
    if (paymentSession?.orderId && paymentIntentId) {
      try {
        await fetch('/api/shop/checkout/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: paymentSession.orderId,
            paymentIntentId,
            locale: resolvedLocale,
          }),
        })
      } catch {
        // Best-effort fallback for local/test environments without Stripe webhook
      }
    }
    writeCart([])
    emitCartUpdated()
    const orderCode = paymentSession?.orderNumber || String(paymentSession?.orderId || '')
    router.push(`/${resolvedLocale}/checkout/success${orderCode ? `?order=${encodeURIComponent(orderCode)}` : ''}`)
  }


  return (
    <div className={styles.page}>
      <section className={styles.form}>
        <CheckoutStepHeader activeStep={activeStep} copy={copy} />

        {error ? <div className={cn(styles.notice, 'typo-small')}>{error}</div> : null}

        {activeStep === 'information' ? (
          <InformationStep
            locale={resolvedLocale}
            copy={copy}
            formState={formState}
            setFormState={setFormState}
            submitting={submitting}
            paymentSession={paymentSession}
            stripePromise={stripePromise}
            stripeOptions={stripeOptions}
            expressPrefetchTried={expressPrefetchTried}
            expressPrefetchError={expressPrefetchError}
            onExpressRetry={onExpressRetry}
            onExpressError={(message) => setError(message || null)}
            onExpressSuccess={onPaymentComplete}
            onGoToShippingStep={onGoToShippingStep}
          />
        ) : activeStep === 'shipping' ? (
          <ShippingStep
            copy={copy}
            formState={formState}
            hasProducts={hasProducts}
            hasServices={hasServices}
            requiresShippingAddress={requiresShippingAddress}
            shippingAddressLabel={shippingAddressLabel}
            shippingLoading={shippingLoading}
            shippingOptions={shippingOptions}
            selectedShippingOptionID={selectedShippingOptionID}
            setSelectedShippingOptionID={setSelectedShippingOptionID}
            productFulfillmentMode={productFulfillmentMode}
            setProductFulfillmentMode={setProductFulfillmentMode}
            serviceAppointmentMode={serviceAppointmentMode}
            setServiceAppointmentMode={setServiceAppointmentMode}
            serviceRequestedDate={serviceRequestedDate}
            setServiceRequestedDate={setServiceRequestedDate}
            serviceRequestedTime={serviceRequestedTime}
            setServiceRequestedTime={setServiceRequestedTime}
            shippingNoticeBlocks={shippingNoticeBlocks}
            submitting={submitting}
            onBackToInformationStep={onBackToInformationStep}
            onGoToPaymentStep={onGoToPaymentStep}
          />
        ) : (
          <PaymentStep
            locale={resolvedLocale}
            copy={copy}
            formState={formState}
            hasProducts={hasProducts}
            hasServices={hasServices}
            requiresShippingAddress={requiresShippingAddress}
            shippingAddressLabel={shippingAddressLabel}
            selectedShippingOption={selectedShippingOption}
            productFulfillmentMode={productFulfillmentMode}
            shippingLabel={shippingLabel}
            serviceAppointmentMode={serviceAppointmentMode}
            serviceRequestedDate={serviceRequestedDate}
            serviceRequestedTime={serviceRequestedTime}
            paymentSession={paymentSession}
            stripePromise={stripePromise}
            stripeOptions={stripeOptions}
            submitting={submitting}
            error={error}
            onBackToInformationStep={onBackToInformationStep}
            onBackToShippingStep={onBackToShippingStep}
            onPaymentError={(message) => setError(message || null)}
            onPaymentComplete={onPaymentComplete}
          />
        )}

        <CheckoutFooterLinks locale={resolvedLocale} copy={copy} />
      </section>

      <CheckoutOrderSummary
        isDesktopViewport={isDesktopViewport}
        items={items}
        copy={copy}
        subtotal={subtotal}
        totalAmount={totalAmount}
        effectiveShippingCurrency={effectiveShippingCurrency}
        shippingLabel={shippingLabel}
        recommended={recommended}
        recommendedLoading={recommendedLoading}
        onAddRecommendedToCart={addRecommendedToCart}
      />
    </div>
  )
}
