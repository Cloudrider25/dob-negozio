import { describe, expect, it } from 'vitest'

import { resolveCheckoutStepTransition } from '@/components/checkout/shared/step-machine'

describe('checkout step machine', () => {
  it('blocks information -> shipping when required fields are missing', () => {
    const result = resolveCheckoutStepTransition({
      currentStep: 'information',
      intent: 'next_from_information',
      context: {
        isFormComplete: false,
        itemsCount: 1,
        submitting: false,
      },
    })

    expect(result).toEqual({
      nextStep: 'information',
      error: 'completeRequiredFields',
    })
  })

  it('moves information -> shipping when form and cart are valid', () => {
    const result = resolveCheckoutStepTransition({
      currentStep: 'information',
      intent: 'next_from_information',
      context: {
        isFormComplete: true,
        itemsCount: 1,
        submitting: false,
      },
    })

    expect(result).toEqual({
      nextStep: 'shipping',
      error: null,
    })
  })

  it('blocks shipping -> payment when cart is empty or submit is in progress', () => {
    const emptyCart = resolveCheckoutStepTransition({
      currentStep: 'shipping',
      intent: 'next_from_shipping',
      context: {
        isFormComplete: true,
        itemsCount: 0,
        submitting: false,
      },
    })

    expect(emptyCart).toEqual({
      nextStep: 'shipping',
      error: 'cartEmptyError',
    })

    const submitting = resolveCheckoutStepTransition({
      currentStep: 'shipping',
      intent: 'next_from_shipping',
      context: {
        isFormComplete: true,
        itemsCount: 2,
        submitting: true,
      },
    })

    expect(submitting).toEqual({
      nextStep: 'shipping',
      error: null,
    })
  })

  it('handles deterministic backward transitions', () => {
    const backToInformation = resolveCheckoutStepTransition({
      currentStep: 'shipping',
      intent: 'back_to_information',
      context: {
        isFormComplete: true,
        itemsCount: 2,
        submitting: false,
      },
    })

    expect(backToInformation).toEqual({
      nextStep: 'information',
      error: null,
    })

    const backToShipping = resolveCheckoutStepTransition({
      currentStep: 'payment',
      intent: 'back_to_shipping',
      context: {
        isFormComplete: true,
        itemsCount: 2,
        submitting: false,
      },
    })

    expect(backToShipping).toEqual({
      nextStep: 'shipping',
      error: null,
    })
  })
})
