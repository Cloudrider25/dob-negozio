import { normalizeThumbnailSrc } from '@/lib/media/thumbnail'

import type { CartItem } from './types'

const normalizeText = (value: string | null | undefined): string =>
  typeof value === 'string' ? value.trim() : ''

const normalizeQuantity = (value: number | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1
  return Math.max(1, Math.floor(value))
}

const normalizePrice = (value: number | undefined): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  if (value < 0) return undefined
  return Math.round(value * 100) / 100
}

const normalizeCurrency = (value: string | undefined): string => {
  const normalized = normalizeText(value).toUpperCase()
  return normalized.length >= 3 ? normalized.slice(0, 3) : 'EUR'
}

export const normalizeCartItem = (item: CartItem): CartItem | null => {
  const id = normalizeText(item.id)
  const title = normalizeText(item.title)
  if (!id || !title) return null

  return {
    id,
    title,
    slug: normalizeText(item.slug) || undefined,
    price: normalizePrice(item.price),
    currency: normalizeCurrency(item.currency),
    brand: normalizeText(item.brand) || undefined,
    coverImage: normalizeThumbnailSrc(item.coverImage),
    quantity: normalizeQuantity(item.quantity),
  }
}

export const normalizeCartItems = (items: CartItem[]): CartItem[] => {
  const byId = new Map<string, CartItem>()

  for (const rawItem of items) {
    const item = normalizeCartItem(rawItem)
    if (!item) continue

    const existing = byId.get(item.id)
    if (!existing) {
      byId.set(item.id, item)
      continue
    }

    byId.set(item.id, {
      ...existing,
      ...item,
      quantity: existing.quantity + item.quantity,
      price: item.price ?? existing.price,
      currency: item.currency || existing.currency,
      coverImage: item.coverImage || existing.coverImage,
      brand: item.brand || existing.brand,
      slug: item.slug || existing.slug,
    })
  }

  return Array.from(byId.values())
}

export const countItemsWithoutPrice = (items: CartItem[]): number =>
  items.reduce((count, item) => (typeof item.price === 'number' ? count : count + 1), 0)
