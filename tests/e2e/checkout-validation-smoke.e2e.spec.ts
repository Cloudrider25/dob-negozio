import { expect, test } from '@playwright/test'

test.describe('Checkout validation smoke', () => {
  test('@smoke rejects checkout when cart is empty', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/shop/checkout', {
      data: {
        locale: 'it',
        customer: {
          email: 'qa.validation@example.com',
          firstName: 'QA',
          lastName: 'Validation',
          address: 'Via Test 1',
          postalCode: '20100',
          city: 'Milano',
          province: 'MI',
          phone: '',
        },
        items: [],
      },
    })

    const json = (await response.json()) as { error?: string }
    expect(response.status()).toBe(400)
    expect(json.error).toBe('Carrello vuoto.')
  })

  test('@smoke rejects service checkout when requested slot is incomplete', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/shop/checkout', {
      data: {
        locale: 'it',
        serviceAppointment: {
          mode: 'requested_slot',
          requestedDate: '',
          requestedTime: '',
        },
        customer: {
          email: 'qa.validation.service@example.com',
          firstName: 'QA',
          lastName: 'Validation',
          address: 'Via Test 1',
          postalCode: '20100',
          city: 'Milano',
          province: 'MI',
          phone: '',
        },
        items: [{ id: '1:service:default', quantity: 1 }],
      },
    })

    const json = (await response.json()) as { error?: string }
    expect(response.status()).toBe(400)
    expect(json.error).toBe('Seleziona data e ora preferita per i servizi.')
  })
})
