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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

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
        coverImage: typeof item.coverImage === 'string' ? item.coverImage : null,
        quantity,
      })
    }
    return items
  } catch {
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
  window.dispatchEvent(new Event(CART_OPEN_EVENT))
}
