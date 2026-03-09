'use client'

import { useCallback } from 'react'

import type { CheckoutStep } from '@/frontend/page-domains/checkout/shared/contracts'
import { resolveCheckoutStepTransition } from '@/frontend/page-domains/checkout/shared/step-machine'

export const useCheckoutStepActions = ({
  activeStep,
  setActiveStep,
  isInformationComplete,
  itemsCount,
  submitting,
  paymentSession,
  createPaymentSession,
  setError,
  completeRequiredFieldsMessage,
  cartEmptyErrorMessage,
  hasProducts,
  hasServices,
}: {
  activeStep: CheckoutStep
  setActiveStep: (next: CheckoutStep) => void
  isInformationComplete: boolean
  itemsCount: number
  submitting: boolean
  paymentSession: unknown
  createPaymentSession: () => Promise<unknown>
  setError: (message: string | null) => void
  completeRequiredFieldsMessage: string
  cartEmptyErrorMessage: string
  hasProducts: boolean
  hasServices: boolean
}) => {
  const onGoToShippingStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: 'next_from_information',
      context: {
        isInformationComplete,
        itemsCount,
        submitting,
        hasProducts,
        hasServices,
      },
    })

    if (result.error === 'completeRequiredFields') {
      setError(completeRequiredFieldsMessage)
      return
    }
    if (result.error === 'cartEmptyError') {
      setError(cartEmptyErrorMessage)
      return
    }

    setError(null)
    setActiveStep(result.nextStep)
  }, [
    activeStep,
    cartEmptyErrorMessage,
    completeRequiredFieldsMessage,
    hasProducts,
    hasServices,
    isInformationComplete,
    itemsCount,
    setActiveStep,
    setError,
    submitting,
  ])

  const onBackToInformationStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: 'back_to_information',
      context: {
        isInformationComplete,
        itemsCount,
        submitting,
        hasProducts,
        hasServices,
      },
    })

    setActiveStep(result.nextStep)
  }, [
    activeStep,
    hasProducts,
    hasServices,
    isInformationComplete,
    itemsCount,
    setActiveStep,
    submitting,
  ])

  const onGoToPaymentStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: activeStep === 'appointment' ? 'next_from_appointment' : 'next_from_shipping',
      context: {
        isInformationComplete,
        itemsCount,
        submitting,
        hasProducts,
        hasServices,
      },
    })

    if (result.error === 'cartEmptyError') {
      setError(cartEmptyErrorMessage)
      return
    }

    setError(null)
    setActiveStep(result.nextStep)

    if (result.nextStep === 'payment' && !paymentSession) {
      void createPaymentSession()
    }
  }, [
    activeStep,
    cartEmptyErrorMessage,
    createPaymentSession,
    hasProducts,
    hasServices,
    isInformationComplete,
    itemsCount,
    paymentSession,
    setActiveStep,
    setError,
    submitting,
  ])

  const onBackToShippingStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: activeStep === 'payment' ? 'back_from_payment' : 'back_from_appointment',
      context: {
        isInformationComplete,
        itemsCount,
        submitting,
        hasProducts,
        hasServices,
      },
    })

    setActiveStep(result.nextStep)
  }, [
    activeStep,
    hasProducts,
    hasServices,
    isInformationComplete,
    itemsCount,
    setActiveStep,
    submitting,
  ])

  return {
    onGoToShippingStep,
    onBackToInformationStep,
    onGoToPaymentStep,
    onBackToShippingStep,
  }
}
