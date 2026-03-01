import type { ShippingOption } from '@/components/checkout/shared/contracts'

type ShippingAddressSnapshot = {
  address: string
  city: string
  province: string
  postalCode: string
}

export type ShippingQuoteResult = {
  amount: number | null
  currency: string
  methods: ShippingOption[]
}

export const fetchShippingQuote = async ({
  shippingAddress,
  subtotal,
  signal,
}: {
  shippingAddress: ShippingAddressSnapshot
  subtotal: number
  signal: AbortSignal
}): Promise<ShippingQuoteResult | null> => {
  const response = await fetch('/api/shop/shipping-quote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      address: shippingAddress.address,
      city: shippingAddress.city,
      province: shippingAddress.province,
      postalCode: shippingAddress.postalCode,
      country: 'IT',
      subtotal,
    }),
  })

  const data = (await response.json()) as {
    ok?: boolean
    amount?: number | null
    currency?: string
    methods?: ShippingOption[]
  }

  if (!response.ok || !data.ok) return null

  const amount = typeof data.amount === 'number' && Number.isFinite(data.amount) ? data.amount : null
  const currency = typeof data.currency === 'string' ? data.currency : 'EUR'
  const methods = Array.isArray(data.methods)
    ? data.methods.filter(
        (method): method is ShippingOption =>
          typeof method?.id === 'string' &&
          typeof method?.name === 'string' &&
          typeof method?.amount === 'number' &&
          Number.isFinite(method.amount),
      )
    : []

  return {
    amount,
    currency,
    methods,
  }
}
