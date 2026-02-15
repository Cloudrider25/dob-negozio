import { POST as checkoutPOST } from '../app/api/shop/checkout/route'

const validCustomer = {
  email: `qa+cart-validation-${Date.now()}@example.com`,
  firstName: 'QA',
  lastName: 'Validation',
  address: 'Via Test 1',
  postalCode: '20100',
  city: 'Milano',
  province: 'MI',
  phone: '',
}

const assertBadRequest = async (payload: unknown, expectedMessagePart: string) => {
  const res = await checkoutPOST(
    new Request('http://localhost/api/shop/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
  const json = (await res.json()) as { error?: string }
  if (res.status !== 400) {
    throw new Error(`Expected 400, got ${res.status}: ${JSON.stringify(json)}`)
  }
  const message = String(json.error || '')
  if (!message.toLowerCase().includes(expectedMessagePart.toLowerCase())) {
    throw new Error(
      `Unexpected validation error message. expected~"${expectedMessagePart}", got "${message}"`,
    )
  }
}

const main = async () => {
  await assertBadRequest(
    {
      locale: 'it',
      customer: validCustomer,
      items: [],
    },
    'Carrello vuoto',
  )

  await assertBadRequest(
    {
      locale: 'it',
      customer: validCustomer,
      items: [{ id: 'fake-product', quantity: 0 }],
    },
    'Carrello vuoto',
  )

  await assertBadRequest(
    {
      locale: 'it',
      customer: { ...validCustomer, email: '' },
      items: [{ id: 'fake-product', quantity: 1 }],
    },
    'Email non valida',
  )

  console.log('OK: Checkout validation handles empty/invalid cart payloads correctly.')
}

await main()
