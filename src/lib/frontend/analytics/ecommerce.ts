import type { CartItem } from '@/lib/frontend/cart/storage'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'

export type AnalyticsItem = {
  item_id: string
  item_name: string
  item_brand?: string
  item_variant?: string
  price?: number
  quantity?: number
  currency?: string
  index?: number
}

type PendingPurchasePayload = {
  matchId: string
  transactionId: string
  value: number
  currency: string
  items: AnalyticsItem[]
}

const PENDING_PURCHASE_KEY = 'dob:analytics:pending-purchase'

export const toAnalyticsItem = (
  item: Pick<CartItem, 'id' | 'title' | 'brand' | 'format' | 'price' | 'quantity' | 'currency'>,
  index?: number,
): AnalyticsItem => ({
  item_id: item.id,
  item_name: item.title,
  item_brand: item.brand,
  item_variant: item.format,
  price: typeof item.price === 'number' ? item.price : undefined,
  quantity: typeof item.quantity === 'number' ? item.quantity : undefined,
  currency: item.currency,
  index,
})

export const computeAnalyticsValue = (
  items: Array<Pick<CartItem, 'price' | 'quantity'>>,
  fallback = 0,
) => {
  const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)
  return Number.isFinite(total) && total > 0 ? total : fallback
}

export const toCarouselAnalyticsItem = (item: CarouselItem, index?: number): AnalyticsItem => ({
  item_id:
    (typeof item.id === 'string' || typeof item.id === 'number'
      ? String(item.id)
      : item.slug || item.href || item.title) ?? item.title,
  item_name: item.title,
  item_brand: item.tag || undefined,
  item_variant: item.subtitle || undefined,
  index,
})

export const persistPendingPurchase = (payload: PendingPurchasePayload) => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(payload))
}

export const consumePendingPurchase = (matchId: string): PendingPurchasePayload | null => {
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(PENDING_PURCHASE_KEY)
  if (!raw) return null

  window.sessionStorage.removeItem(PENDING_PURCHASE_KEY)

  try {
    const parsed = JSON.parse(raw) as PendingPurchasePayload
    if (!parsed || parsed.matchId !== matchId) return null
    if (!parsed.transactionId || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}
