'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'
import { cn } from '@/lib/shared/ui/cn'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n/core'
import { useCheckoutRecommendations } from '../hooks/useCheckoutRecommendations'
import { useCheckoutPaymentSession } from '../hooks/useCheckoutPaymentSession'
import { useCheckoutStepActions } from '../hooks/useCheckoutStepActions'
import { useDesktopViewport } from '../hooks/useDesktopViewport'
import { useShippingQuote } from '../hooks/useShippingQuote'
import {
  type CustomerSnapshot,
  type CheckoutStep,
  isServiceCartItem,
  type RecommendedProduct,
} from '../shared/contracts'
import { formatPrice } from '../shared/format'
import { CheckoutFooterLinks } from '../ui/CheckoutFooterLinks'
import { CheckoutSummaryPanel } from '../ui/CheckoutSummaryPanel'
import { CheckoutStepHeader } from '../ui/CheckoutStepHeader'
import { AppointmentStep } from '../ui/steps/AppointmentStep'
import { InformationStep } from '../ui/steps/InformationStep'
import { PaymentStep } from '../ui/steps/PaymentStep'
import { ShippingStep } from '../ui/steps/ShippingStep'
import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  readCart,
  writeCart,
  type CartItem,
} from '@/lib/frontend/cart/storage'
import { countCheckoutEligibleItems } from '@/lib/frontend/cart/checkoutEligibility'
import {
  persistPendingPurchase,
  toAnalyticsItem,
} from '@/lib/frontend/analytics/ecommerce'
import { trackEvent } from '@/lib/frontend/analytics/gtag'

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
  const [discountCodeInput, setDiscountCodeInput] = useState('')
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('')
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null)
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const isDesktopViewport = useDesktopViewport()
  const [beginCheckoutTrackedKey, setBeginCheckoutTrackedKey] = useState<string | null>(null)
  const [shippingInfoTrackedKey, setShippingInfoTrackedKey] = useState<string | null>(null)
  const [paymentInfoTrackedKey, setPaymentInfoTrackedKey] = useState<string | null>(null)

  useEffect(() => {
    const forcedStep = searchParams?.get('e2eStep')
    if (
      forcedStep !== 'information' &&
      forcedStep !== 'shipping' &&
      forcedStep !== 'appointment' &&
      forcedStep !== 'payment'
    )
      return
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
  const productItemsCount = useMemo(
    () => items.reduce((sum, item) => (isServiceCartItem(item) ? sum : sum + item.quantity), 0),
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
        format: product.format || undefined,
        coverImage: product.coverImage || null,
        quantity: 1,
      })
    }
    writeCart(next)
    emitCartUpdated()
    trackEvent('add_to_cart', {
      currency: product.currency || 'EUR',
      value: typeof product.price === 'number' ? product.price : 0,
      items: [
        toAnalyticsItem(
          {
            id: product.id,
            title: product.title,
            brand: product.brandName || product.lineName || undefined,
            format: product.format || undefined,
            price: typeof product.price === 'number' ? product.price : undefined,
            quantity: 1,
            currency: product.currency || 'EUR',
          },
          0,
        ),
      ],
    })
  }

  const isContactComplete = useMemo(() => {
    const required = [formState.email, formState.firstName, formState.lastName]
    return required.every((value) => value.trim().length > 0)
  }, [formState.email, formState.firstName, formState.lastName])
  const checkoutEligibleItemsCount = useMemo(() => countCheckoutEligibleItems(items), [items])

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

  const isInformationComplete = useMemo(() => {
    return isContactComplete && (!requiresShippingAddress || isShippingAddressComplete)
  }, [isContactComplete, isShippingAddressComplete, requiresShippingAddress])
  const isCheckoutReady = useMemo(() => {
    return isInformationComplete && isServiceAppointmentComplete
  }, [isInformationComplete, isServiceAppointmentComplete])

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
    itemsCount: productItemsCount,
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

  const {
    paymentSession,
    submitting,
    createPaymentSession,
    getLastCreatePaymentSessionError,
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
    discountCode: appliedDiscountCode,
    productFulfillmentMode,
    serviceAppointmentMode,
    serviceRequestedDate,
    serviceRequestedTime,
    isFormComplete: isCheckoutReady,
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
  const displayDiscountAmount =
    typeof paymentSession?.quote?.discountAmount === 'number'
      ? paymentSession.quote.discountAmount
      : typeof paymentSession?.discountAmount === 'number'
        ? paymentSession.discountAmount
        : 0
  const displaySubtotal =
    typeof paymentSession?.quote?.subtotal === 'number' ? paymentSession.quote.subtotal : subtotal
  const displayShippingAmount =
    typeof paymentSession?.quote?.shippingAmount === 'number'
      ? paymentSession.quote.shippingAmount
      : effectiveShippingAmount
  const displayCurrency = paymentSession?.quote?.currency || effectiveShippingCurrency
  const displayShippingLabel =
    typeof paymentSession?.quote?.shippingAmount === 'number'
      ? formatPrice(paymentSession.quote.shippingAmount, displayCurrency)
      : shippingLabel
  const totalAmount =
    typeof paymentSession?.quote?.total === 'number'
      ? paymentSession.quote.total
      : Math.max(0, displaySubtotal - displayDiscountAmount + displayShippingAmount)
  const mobileSummaryLabel = resolvedLocale === 'it' ? 'Riepilogo ordine' : 'Order summary'

  useEffect(() => {
    if (isDesktopViewport) setMobileSummaryOpen(false)
  }, [isDesktopViewport])

  useEffect(() => {
    if (activeStep !== 'payment') return
    if (!items.length) return
    if (beginCheckoutTrackedKey === cartFingerprint) return

    trackEvent('begin_checkout', {
      currency: displayCurrency || 'EUR',
      value: totalAmount,
      coupon: appliedDiscountCode || undefined,
      items: items.map((item, index) => toAnalyticsItem(item, index)),
    })
    setBeginCheckoutTrackedKey(cartFingerprint)
  }, [activeStep, appliedDiscountCode, beginCheckoutTrackedKey, cartFingerprint, displayCurrency, items, totalAmount])

  useEffect(() => {
    if (activeStep !== 'payment') return
    if (!items.length) return

    const shippingTier =
      productFulfillmentMode === 'pickup'
        ? 'pickup'
        : selectedShippingOption?.name || (hasProducts ? 'shipping' : 'services_only')
    const trackingKey = `${cartFingerprint}:${productFulfillmentMode}:${selectedShippingOptionID || 'none'}:${serviceAppointmentMode}`
    if (shippingInfoTrackedKey === trackingKey) return

    trackEvent('add_shipping_info', {
      currency: displayCurrency || 'EUR',
      value: totalAmount,
      coupon: appliedDiscountCode || undefined,
      shipping_tier: shippingTier,
      items: items.map((item, index) => toAnalyticsItem(item, index)),
    })
    setShippingInfoTrackedKey(trackingKey)
  }, [
    activeStep,
    appliedDiscountCode,
    cartFingerprint,
    displayCurrency,
    hasProducts,
    items,
    productFulfillmentMode,
    selectedShippingOption?.name,
    selectedShippingOptionID,
    serviceAppointmentMode,
    shippingInfoTrackedKey,
    totalAmount,
  ])

  useEffect(() => {
    if (activeStep !== 'payment') return
    if (!paymentSession) return
    if (!items.length) return

    const trackingKey = `${cartFingerprint}:${paymentSession.attemptId || paymentSession.clientSecret}`
    if (paymentInfoTrackedKey === trackingKey) return

    trackEvent('add_payment_info', {
      currency: displayCurrency || 'EUR',
      value: totalAmount,
      coupon: appliedDiscountCode || undefined,
      payment_type: 'stripe_payment_element',
      items: items.map((item, index) => toAnalyticsItem(item, index)),
    })
    setPaymentInfoTrackedKey(trackingKey)
  }, [
    activeStep,
    appliedDiscountCode,
    cartFingerprint,
    displayCurrency,
    items,
    paymentInfoTrackedKey,
    paymentSession,
    totalAmount,
  ])

  const { onGoToShippingStep, onBackToInformationStep, onGoToPaymentStep, onBackToShippingStep } =
    useCheckoutStepActions({
      activeStep,
      setActiveStep,
      isInformationComplete,
      itemsCount: checkoutEligibleItemsCount,
      submitting,
      paymentSession,
      createPaymentSession: async () => createPaymentSession(),
      setError,
      completeRequiredFieldsMessage: copy.messages.completeRequiredFields,
      cartEmptyErrorMessage: copy.messages.cartEmptyError,
      hasProducts,
      hasServices,
    })

  const informationNextLabel = hasProducts ? copy.actions.goToShipping : copy.actions.goToAppointment
  const shippingNextLabel = hasServices
    ? copy.actions.continueToAppointment
    : copy.actions.continueToPayment
  const appointmentBackLabel = hasProducts
    ? copy.actions.returnToShipping
    : copy.actions.returnToInformation
  const paymentBackLabel = hasServices
    ? copy.actions.returnToAppointment
    : copy.actions.returnToShipping

  const onPaymentComplete = useCallback(async (paymentIntentId?: string) => {
    let resolvedOrderCode = paymentSession?.orderNumber || String(paymentSession?.orderId || '')

    if (paymentSession?.attemptId || paymentSession?.orderId) {
      try {
        const response = await fetch('/api/shop/checkout/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId: paymentSession.attemptId,
            orderId: paymentSession.orderId,
            paymentIntentId,
            locale: resolvedLocale,
          }),
        })
        const data = (await response.json()) as {
          orderNumber?: string
          orderId?: string | number
        }
        if (response.ok) {
          resolvedOrderCode =
            (typeof data.orderNumber === 'string' && data.orderNumber) ||
            String(data.orderId || resolvedOrderCode || '')
        }
      } catch {
        // Best-effort fallback for local/test environments without Stripe webhook
      }
    }
    const transactionId =
      resolvedOrderCode ||
      (paymentIntentId ? String(paymentIntentId) : '') ||
      (paymentSession?.attemptId ? String(paymentSession.attemptId) : '')
    const matchId =
      resolvedOrderCode ||
      (paymentIntentId ? String(paymentIntentId) : '') ||
      (paymentSession?.attemptId ? String(paymentSession.attemptId) : '')

    if (transactionId && matchId) {
      persistPendingPurchase({
        matchId,
        transactionId,
        value: totalAmount,
        currency: displayCurrency || 'EUR',
        items: items.map((item, index) => toAnalyticsItem(item, index)),
      })
    }

    writeCart([])
    emitCartUpdated()
    const params = new URLSearchParams()
    if (resolvedOrderCode) {
      params.set('order', resolvedOrderCode)
    } else {
      if (paymentSession?.attemptId) params.set('attempt', String(paymentSession.attemptId))
      if (paymentIntentId) params.set('payment_intent', paymentIntentId)
    }
    router.push(`/${resolvedLocale}/checkout/success${params.toString() ? `?${params.toString()}` : ''}`)
  }, [
    paymentSession,
    resolvedLocale,
    router,
    displayCurrency,
    totalAmount,
    items,
  ])

  const onApplyDiscountCode = async () => {
    const normalized = discountCodeInput.trim().toUpperCase()
    setError(null)
    setDiscountCodeError(null)

    if (!normalized) {
      setAppliedDiscountCode('')
      return
    }

    const session = await createPaymentSession({
      silent: false,
      allowIncomplete: true,
      quoteOnly: true,
      overrideDiscountCode: normalized,
    })

    if (session) {
      setAppliedDiscountCode(normalized)
      setDiscountCodeInput(normalized)
      return
    }

    const failureMessage = getLastCreatePaymentSessionError()
    const isCheckoutStateError =
      failureMessage === copy.messages.completeRequiredFields ||
      failureMessage === copy.messages.cartEmptyError ||
      failureMessage === copy.messages.unavailableProducts ||
      failureMessage === copy.messages.insufficientAvailability ||
      failureMessage === copy.messages.checkoutResponseInvalid ||
      failureMessage === copy.messages.checkoutFailed

    setAppliedDiscountCode('')

    if (failureMessage && isCheckoutStateError) {
      return
    }

    if (failureMessage && !isCheckoutStateError) {
      setDiscountCodeError(failureMessage)
      setError(null)
      return
    }

    setDiscountCodeError('Codice non valido')
  }

  const onRemoveDiscountCode = async () => {
    setError(null)
    setDiscountCodeError(null)
    setDiscountCodeInput('')
    setAppliedDiscountCode('')

    if (activeStep !== 'payment') return
    if (!paymentSession) return

    await createPaymentSession({
      silent: false,
      overrideDiscountCode: '',
    })
  }

  const onDiscountCodeInputChange = (value: string) => {
    setDiscountCodeError(null)
    setDiscountCodeInput(value)
  }

  useEffect(() => {
    if (!appliedDiscountCode) return
    if (!items.length) return
    if (activeStep === 'payment') return

    void createPaymentSession({
      silent: true,
      allowIncomplete: true,
      quoteOnly: true,
      overrideDiscountCode: appliedDiscountCode,
    })
  }, [
    activeStep,
    appliedDiscountCode,
    cartFingerprint,
    createPaymentSession,
    items.length,
    productFulfillmentMode,
    selectedShippingOptionID,
    serviceAppointmentMode,
    serviceRequestedDate,
    serviceRequestedTime,
  ])

  useEffect(() => {
    if (activeStep !== 'payment') return
    if (!isCheckoutReady) return
    if (paymentSession && paymentSession.quoteOnly !== true) return

    let cancelled = false

    const ensureFinalSession = async () => {
      const session = await createPaymentSession({
        silent: false,
      })

      if (cancelled || !session) return
    }

    void ensureFinalSession()

    return () => {
      cancelled = true
    }
  }, [activeStep, createPaymentSession, isCheckoutReady, paymentSession])

  return (
    <div className={styles.page}>
      <section className={styles.form}>
        <CheckoutStepHeader
          activeStep={activeStep}
          copy={copy}
          hasProducts={hasProducts}
          hasServices={hasServices}
          mobileSummary={
            !isDesktopViewport ? (
              <>
                <button
                  type="button"
                  className={styles.mobileSummaryToggle}
                  onClick={() => setMobileSummaryOpen((current) => !current)}
                  aria-expanded={mobileSummaryOpen}
                  aria-controls="checkout-mobile-summary"
                >
                  <span className={cn(styles.mobileSummaryToggleLeading, 'typo-caption-upper')}>
                    <span>{mobileSummaryLabel}</span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={cn(
                        styles.mobileSummaryChevron,
                        mobileSummaryOpen && styles.mobileSummaryChevronOpen,
                      )}
                    />
                  </span>
                  <span className={cn(styles.mobileSummaryTotal, 'typo-body-lg')}>
                    {formatPrice(totalAmount, displayCurrency)}
                  </span>
                </button>
                {mobileSummaryOpen ? (
                  <div id="checkout-mobile-summary" className={styles.mobileSummaryPanel}>
                    <CheckoutSummaryPanel
                      variant="mobile"
                      items={items}
                      copy={copy}
                      subtotal={displaySubtotal}
                      totalAmount={totalAmount}
                      discountAmount={displayDiscountAmount}
                      effectiveShippingCurrency={displayCurrency}
                      shippingLabel={displayShippingLabel}
                      discountCodeInput={discountCodeInput}
                      appliedDiscountCode={appliedDiscountCode}
                      discountCodeError={discountCodeError}
                      onDiscountCodeInputChange={onDiscountCodeInputChange}
                      onApplyDiscountCode={onApplyDiscountCode}
                      onRemoveDiscountCode={onRemoveDiscountCode}
                      recommended={recommended}
                      recommendedLoading={recommendedLoading}
                      onAddRecommendedToCart={addRecommendedToCart}
                    />
                  </div>
                ) : null}
              </>
            ) : null
          }
        />

        {error ? <div className={cn(styles.notice, 'typo-small')}>{error}</div> : null}

        {activeStep === 'information' ? (
          <InformationStep
            locale={resolvedLocale}
            copy={copy}
            formState={formState}
            setFormState={setFormState}
            isFormComplete={isInformationComplete}
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
            nextStepLabel={informationNextLabel}
          />
        ) : activeStep === 'shipping' ? (
          <ShippingStep
            copy={copy}
            formState={formState}
            hasProducts={hasProducts}
            requiresShippingAddress={requiresShippingAddress}
            shippingAddressLabel={shippingAddressLabel}
            shippingLoading={shippingLoading}
            shippingOptions={shippingOptions}
            selectedShippingOptionID={selectedShippingOptionID}
            setSelectedShippingOptionID={setSelectedShippingOptionID}
            productFulfillmentMode={productFulfillmentMode}
            setProductFulfillmentMode={setProductFulfillmentMode}
            shippingNoticeBlocks={shippingNoticeBlocks}
            submitting={submitting}
            onBackToInformationStep={onBackToInformationStep}
            onGoToNextStep={onGoToPaymentStep}
            nextStepLabel={shippingNextLabel}
          />
        ) : activeStep === 'appointment' ? (
          <AppointmentStep
            copy={copy}
            serviceAppointmentMode={serviceAppointmentMode}
            setServiceAppointmentMode={setServiceAppointmentMode}
            serviceRequestedDate={serviceRequestedDate}
            setServiceRequestedDate={setServiceRequestedDate}
            serviceRequestedTime={serviceRequestedTime}
            setServiceRequestedTime={setServiceRequestedTime}
            isAppointmentComplete={isServiceAppointmentComplete}
            submitting={submitting}
            onBack={onBackToShippingStep}
            onGoToPaymentStep={onGoToPaymentStep}
            backLabel={appointmentBackLabel}
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
            onBackToPreviousStep={onBackToShippingStep}
            backLabel={paymentBackLabel}
            onPaymentError={(message) => setError(message || null)}
            onPaymentComplete={onPaymentComplete}
          />
        )}

        <CheckoutFooterLinks locale={resolvedLocale} copy={copy} />
      </section>

      <CheckoutSummaryPanel
        variant="desktop"
        items={items}
        copy={copy}
        subtotal={displaySubtotal}
        totalAmount={totalAmount}
        discountAmount={displayDiscountAmount}
        effectiveShippingCurrency={displayCurrency}
        shippingLabel={displayShippingLabel}
        discountCodeInput={discountCodeInput}
        appliedDiscountCode={appliedDiscountCode}
        discountCodeError={discountCodeError}
        onDiscountCodeInputChange={onDiscountCodeInputChange}
        onApplyDiscountCode={onApplyDiscountCode}
        onRemoveDiscountCode={onRemoveDiscountCode}
        recommended={recommended}
        recommendedLoading={recommendedLoading}
        onAddRecommendedToCart={addRecommendedToCart}
      />
    </div>
  )
}
