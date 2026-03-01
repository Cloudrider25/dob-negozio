import { describe, expect, it } from 'vitest'

import { buildCheckoutSubmitPayload } from '@/components/checkout/shared/checkout-submit'
import type { CartItem } from '@/lib/cartStorage'

const customer = {
  email: 'user@example.com',
  firstName: 'Mario',
  lastName: 'Rossi',
  address: 'Via Roma 1',
  postalCode: '20100',
  city: 'Milano',
  province: 'MI',
  phone: '123',
}

describe('checkout submit payload normalization', () => {
  it('forces fulfillment none and removes shippingOption when only services are in cart', () => {
    const items: CartItem[] = [
      { id: '10:service:laser', title: 'Service', quantity: 1, price: 10, currency: 'EUR' },
    ]

    const payload = buildCheckoutSubmitPayload({
      locale: 'it',
      customer,
      items,
      shippingOptionID: 'ship_standard',
      productFulfillmentMode: 'shipping',
      serviceAppointmentMode: 'contact_later',
      serviceRequestedDate: '',
      serviceRequestedTime: '',
    })

    expect(payload.productFulfillmentMode).toBe('none')
    expect(payload.shippingOptionID).toBeUndefined()
    expect(payload.serviceAppointment).toEqual({ mode: 'contact_later' })
  })

  it('falls back to contact_later when requested slot is incomplete', () => {
    const items: CartItem[] = [
      { id: '20:service:consultation', title: 'Service', quantity: 1, price: 20, currency: 'EUR' },
    ]

    const payload = buildCheckoutSubmitPayload({
      locale: 'it',
      customer,
      items,
      shippingOptionID: null,
      productFulfillmentMode: 'none',
      serviceAppointmentMode: 'requested_slot',
      serviceRequestedDate: '2026-03-10',
      serviceRequestedTime: '',
    })

    expect(payload.serviceAppointment).toEqual({ mode: 'contact_later' })
  })

  it('keeps shipping option only when products require shipping and normalizes items', () => {
    const items: CartItem[] = [
      { id: ' 101 ', title: 'Product', quantity: 0, price: 20, currency: 'EUR' },
      { id: '', title: 'Invalid', quantity: 3 },
      { id: '30:service:check', title: 'Service', quantity: 2, price: 10, currency: 'EUR' },
    ]

    const payload = buildCheckoutSubmitPayload({
      locale: 'it',
      customer,
      items,
      shippingOptionID: 'ship_express',
      productFulfillmentMode: 'shipping',
      serviceAppointmentMode: 'requested_slot',
      serviceRequestedDate: '2026-03-12',
      serviceRequestedTime: '14:30',
    })

    expect(payload.productFulfillmentMode).toBe('shipping')
    expect(payload.shippingOptionID).toBe('ship_express')
    expect(payload.items).toEqual([
      { id: '101', quantity: 1 },
      { id: '30:service:check', quantity: 2 },
    ])
    expect(payload.serviceAppointment).toEqual({
      mode: 'requested_slot',
      requestedDate: '2026-03-12',
      requestedTime: '14:30',
    })
  })
})
