import type { CartItem } from '@/lib/cartStorage'
import type { StripeElementLocale } from '@stripe/stripe-js'
import { getJourneyDictionary } from '@/lib/i18n'

export type PaymentSession = {
  clientSecret: string
  publishableKey: string
  orderNumber?: string
  orderId?: string | number
}

export type RecommendedProduct = {
  id: string
  title: string
  price: number | null
  currency: string
  format: string
  coverImage: string | null
  lineName: string
  brandName: string
}

export type CustomerSnapshot = {
  email: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  province: string
  phone: string
}

export type ShippingOption = {
  id: string
  name: string
  amount: number
  currency: string
  deliveryEstimate: string
}

export type CheckoutStep = 'information' | 'shipping' | 'payment'

export type CheckoutCopy = ReturnType<typeof getJourneyDictionary>['checkout']

export const STRIPE_LOCALE_MAP: Record<string, StripeElementLocale> = {
  it: 'it',
  en: 'en',
  ru: 'ru',
}

export const isServiceCartItem = (item: CartItem) =>
  item.id.includes(':service:') || item.id.includes(':package:')
