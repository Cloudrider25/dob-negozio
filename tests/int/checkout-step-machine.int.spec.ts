import { describe, expect, it } from 'vitest'

import { resolveCheckoutStepTransition } from '@/frontend/page-domains/checkout/shared/step-machine'

describe('checkout step machine', () => {
  it('blocks information -> shipping when required fields are missing', () => {
    const result = resolveCheckoutStepTransition({
      currentStep: 'information',
      intent: 'next_from_information',
      context: {
        isInformationComplete: false,
        itemsCount: 1,
        submitting: false,
        hasProducts: true,
        hasServices: false,
      },
    })

    expect(result).toEqual({
      nextStep: 'information',
      error: 'completeRequiredFields',
    })
  })

  it('routes information to the correct next step based on cart type', () => {
    const productOnly = resolveCheckoutStepTransition({
      currentStep: 'information',
      intent: 'next_from_information',
      context: {
        isInformationComplete: true,
        itemsCount: 1,
        submitting: false,
        hasProducts: true,
        hasServices: false,
      },
    })

    expect(productOnly).toEqual({
      nextStep: 'shipping',
      error: null,
    })

    const serviceOnly = resolveCheckoutStepTransition({
      currentStep: 'information',
      intent: 'next_from_information',
      context: {
        isInformationComplete: true,
        itemsCount: 1,
        submitting: false,
        hasProducts: false,
        hasServices: true,
      },
    })

    expect(serviceOnly).toEqual({
      nextStep: 'appointment',
      error: null,
    })
  })

  it('blocks shipping -> next when cart is empty or submit is in progress', () => {
    const emptyCart = resolveCheckoutStepTransition({
      currentStep: 'shipping',
      intent: 'next_from_shipping',
      context: {
        isInformationComplete: true,
        itemsCount: 0,
        submitting: false,
        hasProducts: true,
        hasServices: false,
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
        isInformationComplete: true,
        itemsCount: 2,
        submitting: true,
        hasProducts: true,
        hasServices: false,
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
        isInformationComplete: true,
        itemsCount: 2,
        submitting: false,
        hasProducts: true,
        hasServices: false,
      },
    })

    expect(backToInformation).toEqual({
      nextStep: 'information',
      error: null,
    })

    const backToAppointment = resolveCheckoutStepTransition({
      currentStep: 'payment',
      intent: 'back_from_payment',
      context: {
        isInformationComplete: true,
        itemsCount: 2,
        submitting: false,
        hasProducts: false,
        hasServices: true,
      },
    })

    expect(backToAppointment).toEqual({
      nextStep: 'appointment',
      error: null,
    })
  })

  it('routes shipping to appointment for mixed carts and appointment to payment', () => {
    const mixedNext = resolveCheckoutStepTransition({
      currentStep: 'shipping',
      intent: 'next_from_shipping',
      context: {
        isInformationComplete: true,
        itemsCount: 2,
        submitting: false,
        hasProducts: true,
        hasServices: true,
      },
    })

    expect(mixedNext).toEqual({
      nextStep: 'appointment',
      error: null,
    })

    const appointmentNext = resolveCheckoutStepTransition({
      currentStep: 'appointment',
      intent: 'next_from_appointment',
      context: {
        isInformationComplete: true,
        itemsCount: 1,
        submitting: false,
        hasProducts: false,
        hasServices: true,
      },
    })

    expect(appointmentNext).toEqual({
      nextStep: 'payment',
      error: null,
    })
  })
})
