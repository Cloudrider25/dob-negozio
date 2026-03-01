import type { CartItem } from './types'
import { isServiceLikeCartItem } from './itemKind'

const isNumericId = (value: string): boolean => /^\d+$/.test(value)

export const getRecommendationSeedProductId = (items: CartItem[]): number | null => {
  const candidate = items.find((item) => !isServiceLikeCartItem(item) && isNumericId(item.id.trim()))
  if (!candidate) return null

  const productId = Number(candidate.id)
  return Number.isFinite(productId) ? productId : null
}
