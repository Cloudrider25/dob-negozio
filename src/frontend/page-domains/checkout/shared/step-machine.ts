import type { CheckoutStep } from '@/frontend/page-domains/checkout/shared/contracts'

type TransitionIntent =
  | 'next_from_information'
  | 'next_from_shipping'
  | 'next_from_appointment'
  | 'back_to_information'
  | 'back_from_appointment'
  | 'back_from_payment'

type TransitionContext = {
  isInformationComplete: boolean
  itemsCount: number
  submitting: boolean
  hasProducts: boolean
  hasServices: boolean
}

type TransitionError = 'completeRequiredFields' | 'cartEmptyError' | null

type TransitionResult = {
  nextStep: CheckoutStep
  error: TransitionError
}

export const resolveCheckoutStepTransition = ({
  currentStep,
  intent,
  context,
}: {
  currentStep: CheckoutStep
  intent: TransitionIntent
  context: TransitionContext
}): TransitionResult => {
  if (intent === 'back_to_information') {
    return { nextStep: 'information', error: null }
  }

  if (intent === 'back_from_appointment') {
    return { nextStep: context.hasProducts ? 'shipping' : 'information', error: null }
  }

  if (intent === 'back_from_payment') {
    if (context.hasServices) {
      return { nextStep: 'appointment', error: null }
    }
    if (context.hasProducts) {
      return { nextStep: 'shipping', error: null }
    }
    return { nextStep: 'information', error: null }
  }

  if (intent === 'next_from_information') {
    if (!context.isInformationComplete) {
      return { nextStep: currentStep, error: 'completeRequiredFields' }
    }
    if (context.itemsCount === 0) {
      return { nextStep: currentStep, error: 'cartEmptyError' }
    }
    if (context.hasProducts) {
      return { nextStep: 'shipping', error: null }
    }
    if (context.hasServices) {
      return { nextStep: 'appointment', error: null }
    }
    return { nextStep: currentStep, error: 'cartEmptyError' }
  }

  if (context.itemsCount === 0) {
    return { nextStep: currentStep, error: 'cartEmptyError' }
  }

  if (context.submitting) {
    return { nextStep: currentStep, error: null }
  }

  if (intent === 'next_from_shipping') {
    return { nextStep: context.hasServices ? 'appointment' : 'payment', error: null }
  }

  return { nextStep: 'payment', error: null }
}
