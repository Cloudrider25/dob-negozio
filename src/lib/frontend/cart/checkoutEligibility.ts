import type { CartItem } from '@/lib/frontend/cart/storage'

export type CheckoutEligibleItem = {
  id: string
  quantity: number
}

const normalizeId = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const normalizeQuantity = (value: unknown) => {
  const quantity = typeof value === 'number' && Number.isFinite(value) ? value : 0
  if (quantity <= 0) return 0
  return Math.min(50, Math.floor(quantity))
}

export const toCheckoutEligibleItems = (items: CartItem[]): CheckoutEligibleItem[] =>
  items
    .map((item) => ({
      id: normalizeId(item.id),
      quantity: normalizeQuantity(item.quantity),
    }))
    .filter((item) => item.id.length > 0 && item.quantity > 0)

export const countCheckoutEligibleItems = (items: CartItem[]): number =>
  toCheckoutEligibleItems(items).reduce((count, item) => count + item.quantity, 0)

export const hasCheckoutEligibleItems = (items: CartItem[]): boolean =>
  toCheckoutEligibleItems(items).length > 0
