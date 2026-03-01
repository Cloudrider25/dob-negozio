import type { CheckoutStep } from '@/components/checkout/shared/contracts'

type TransitionIntent = 'next_from_information' | 'next_from_shipping' | 'back_to_information' | 'back_to_shipping'

type TransitionContext = {
  isFormComplete: boolean
  itemsCount: number
  submitting: boolean
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

  if (intent === 'back_to_shipping') {
    return { nextStep: 'shipping', error: null }
  }

  if (intent === 'next_from_information') {
    if (!context.isFormComplete) {
      return { nextStep: currentStep, error: 'completeRequiredFields' }
    }
    if (context.itemsCount === 0) {
      return { nextStep: currentStep, error: 'cartEmptyError' }
    }
    return { nextStep: 'shipping', error: null }
  }

  if (context.itemsCount === 0) {
    return { nextStep: currentStep, error: 'cartEmptyError' }
  }

  if (context.submitting) {
    return { nextStep: currentStep, error: null }
  }

  return { nextStep: 'payment', error: null }
}
