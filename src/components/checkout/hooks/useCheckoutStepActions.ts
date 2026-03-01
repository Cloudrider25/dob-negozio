'use client'

import { useCallback } from 'react'

import type { CheckoutStep } from '@/components/checkout/shared/contracts'
import { resolveCheckoutStepTransition } from '@/components/checkout/shared/step-machine'

export const useCheckoutStepActions = ({
  activeStep,
  setActiveStep,
  isFormComplete,
  itemsCount,
  submitting,
  paymentSession,
  createPaymentSession,
  setError,
  completeRequiredFieldsMessage,
  cartEmptyErrorMessage,
}: {
  activeStep: CheckoutStep
  setActiveStep: (next: CheckoutStep) => void
  isFormComplete: boolean
  itemsCount: number
  submitting: boolean
  paymentSession: unknown
  createPaymentSession: () => Promise<void>
  setError: (message: string | null) => void
  completeRequiredFieldsMessage: string
  cartEmptyErrorMessage: string
}) => {
  const onGoToShippingStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: 'next_from_information',
      context: {
        isFormComplete,
        itemsCount,
        submitting,
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
    isFormComplete,
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
        isFormComplete,
        itemsCount,
        submitting,
      },
    })

    setActiveStep(result.nextStep)
  }, [activeStep, isFormComplete, itemsCount, setActiveStep, submitting])

  const onGoToPaymentStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: 'next_from_shipping',
      context: {
        isFormComplete,
        itemsCount,
        submitting,
      },
    })

    if (result.error === 'cartEmptyError') {
      setError(cartEmptyErrorMessage)
      return
    }

    if (result.nextStep !== 'payment') return

    setError(null)
    setActiveStep(result.nextStep)

    if (!paymentSession) {
      void createPaymentSession()
    }
  }, [
    activeStep,
    cartEmptyErrorMessage,
    createPaymentSession,
    isFormComplete,
    itemsCount,
    paymentSession,
    setActiveStep,
    setError,
    submitting,
  ])

  const onBackToShippingStep = useCallback(() => {
    const result = resolveCheckoutStepTransition({
      currentStep: activeStep,
      intent: 'back_to_shipping',
      context: {
        isFormComplete,
        itemsCount,
        submitting,
      },
    })

    setActiveStep(result.nextStep)
  }, [activeStep, isFormComplete, itemsCount, setActiveStep, submitting])

  return {
    onGoToShippingStep,
    onBackToInformationStep,
    onGoToPaymentStep,
    onBackToShippingStep,
  }
}
