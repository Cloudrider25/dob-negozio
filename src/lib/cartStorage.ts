import { normalizeThumbnailSrc } from '@/lib/media/thumbnail'

export type CartItem = {
  id: string
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: string | null
  quantity: number
}

export const CART_STORAGE_KEY = 'dob:cart'
export const CART_UPDATED_EVENT = 'dob:cart-updated'
export const CART_OPEN_EVENT = 'dob:cart-open'
export const CART_OPEN_REQUESTED_FLAG = '__dobCartRequestedOpen'

declare global {
  interface Window {
    __dobCartRequestedOpen?: boolean
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const readLegacyCoverImage = (item: Record<string, unknown>): string | null => {
  const direct = normalizeThumbnailSrc(item.coverImage)
  if (direct) return direct
  const image = normalizeThumbnailSrc(item.image)
  if (image) return image
  const thumbnail = normalizeThumbnailSrc(item.thumbnail)
  if (thumbnail) return thumbnail
  const imageUrl = normalizeThumbnailSrc(item.imageUrl)
  if (imageUrl) return imageUrl
  return null
}

export const parseCartItems = (raw: string | null): CartItem[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const items: CartItem[] = []
    for (const item of parsed) {
      if (!isRecord(item)) continue
      const id = typeof item.id === 'string' ? item.id : ''
      const title = typeof item.title === 'string' ? item.title : ''
      const quantity =
        typeof item.quantity === 'number' && Number.isFinite(item.quantity)
          ? Math.max(1, Math.floor(item.quantity))
          : 1
      if (!id || !title) continue
      items.push({
        id,
        title,
        slug: typeof item.slug === 'string' ? item.slug : undefined,
        price: typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : undefined,
        currency: typeof item.currency === 'string' ? item.currency : undefined,
        brand: typeof item.brand === 'string' ? item.brand : undefined,
        coverImage: readLegacyCoverImage(item),
        quantity,
      })
    }
    return items
  } catch {
    if (typeof window !== 'undefined') {
      console.warn('Invalid cart payload found in localStorage. Cart has been reset.')
    }
    return []
  }
}

export const readCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  return parseCartItems(window.localStorage.getItem(CART_STORAGE_KEY))
}

export const writeCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const emitCartUpdated = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

export const emitCartOpen = () => {
  if (typeof window === 'undefined') return
  window[CART_OPEN_REQUESTED_FLAG] = true
  window.dispatchEvent(new Event(CART_OPEN_EVENT))
}

export const consumeCartOpenRequest = (): boolean => {
  if (typeof window === 'undefined') return false
  const requested = Boolean(window[CART_OPEN_REQUESTED_FLAG])
  if (requested) {
    window[CART_OPEN_REQUESTED_FLAG] = false
  }
  return requested
}
