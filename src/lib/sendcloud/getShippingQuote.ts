import type { Payload } from 'payload'

import { getShopIntegrationsConfig } from '@/lib/shop/shopIntegrationsConfig'

type ShippingMethodCountry = {
  iso_2?: string | null
  price?: number | string | null
}

type ShippingMethod = {
  id?: number | null
  name?: string | null
  price?: number | string | null
  min_delivery_days?: number | null
  max_delivery_days?: number | null
  delivery_time?: string | null
  countries?: ShippingMethodCountry[] | null
}

const toString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const toCountryISO2 = (value: unknown) => {
  const raw = toString(value).toUpperCase()
  if (!raw) return 'IT'
  if (raw === 'ITALY' || raw === 'ITALIA') return 'IT'
  return raw.length === 2 ? raw : 'IT'
}

const deliveryEstimate = (method: ShippingMethod) => {
  const minDays = toNumber(method.min_delivery_days)
  const maxDays = toNumber(method.max_delivery_days)
  const explicit = toString(method.delivery_time)
  if (explicit) return explicit
  if (typeof minDays === 'number' && typeof maxDays === 'number' && minDays <= maxDays) {
    return `Delivery time: ${minDays}-${maxDays} business days`
  }
  if (typeof minDays === 'number') {
    return `Delivery time: from ${minDays} business days`
  }
  return ''
}

export type SendcloudShippingOption = {
  id: string
  name: string
  amount: number
  currency: string
  deliveryEstimate: string
}

export const getSendcloudShippingOptions = async ({
  payload,
  toCountry,
  toPostalCode,
}: {
  payload: Payload
  toCountry: string
  toPostalCode: string
}): Promise<SendcloudShippingOption[]> => {
  const config = await getShopIntegrationsConfig(payload)
  const publicKey = config.sendcloud.publicKey
  const secretKey = config.sendcloud.secretKey
  if (!publicKey || !secretKey) return []

  const destinationCountry = toCountryISO2(toCountry)
  const postalCode = toString(toPostalCode)
  if (!postalCode) return []

  const baseUrl = toString(process.env.SENDCLOUD_API_BASE_URL) || 'https://panel.sendcloud.sc'
  const requestURL = new URL(`${baseUrl}/api/v2/shipping_methods`)
  requestURL.searchParams.set('to_country', destinationCountry)
  requestURL.searchParams.set('to_postal_code', postalCode)

  const response = await fetch(requestURL.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString('base64')}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Sendcloud shipping_methods failed (${response.status}): ${errorText}`)
  }

  const json = (await response.json()) as {
    shipping_methods?: ShippingMethod[]
  }

  const shippingMethods = Array.isArray(json.shipping_methods) ? json.shipping_methods : []
  if (shippingMethods.length === 0) return []

  const options: SendcloudShippingOption[] = []
  for (const method of shippingMethods) {
    const topLevel = toNumber(method.price)
    const countryPrice = Array.isArray(method.countries)
      ? method.countries
          .filter((country) => toCountryISO2(country.iso_2) === destinationCountry)
          .map((country) => toNumber(country.price))
          .find((value) => typeof value === 'number')
      : null

    const price = typeof countryPrice === 'number' ? countryPrice : topLevel
    if (typeof price !== 'number' || price < 0) continue
    options.push({
      id:
        (typeof method.id === 'number' ? String(method.id) : '') ||
        `${toString(method.name) || 'sendcloud'}-${price}`,
      name: toString(method.name) || 'Sendcloud',
      amount: price,
      currency: 'EUR',
      deliveryEstimate: deliveryEstimate(method),
    })
  }

  return options.sort((a, b) => a.amount - b.amount)
}

export const getSendcloudShippingQuote = async (args: {
  payload: Payload
  toCountry: string
  toPostalCode: string
}): Promise<{ amount: number; currency: string; methodName: string } | null> => {
  const options = await getSendcloudShippingOptions(args)
  if (options.length === 0) return null
  return {
    amount: options[0].amount,
    currency: options[0].currency,
    methodName: options[0].name,
  }
}
