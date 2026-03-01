import { describe, expect, it } from 'vitest'

import {
  computeSubtotal,
  countItemsWithoutPrice,
  decrementCartItem,
  getRecommendationSeedProductId,
  getCartItemKind,
  incrementCartItem,
  isServiceLikeCartItem,
  normalizeCartItems,
  removeCartItem,
  type CartItem,
} from '@/components/cart'

describe('cart domain normalization', () => {
  it('normalizes legacy values and merges duplicated ids', () => {
    const input: CartItem[] = [
      {
        id: '  101  ',
        title: ' Product A ',
        price: 12.499,
        currency: 'eur',
        quantity: 1,
        coverImage: '  /img/a.jpg ',
      },
      {
        id: '101',
        title: 'Product A',
        quantity: 2,
      },
      {
        id: '  ',
        title: 'Invalid',
        quantity: 1,
      },
      {
        id: 'service:invalid',
        title: ' Service ',
        price: -10,
        quantity: 1,
      },
    ]

    const normalized = normalizeCartItems(input)

    expect(normalized).toHaveLength(2)
    expect(normalized[0]).toMatchObject({
      id: '101',
      title: 'Product A',
      quantity: 3,
      price: 12.5,
      currency: 'EUR',
      coverImage: '/img/a.jpg',
    })
    expect(normalized[1]).toMatchObject({
      id: 'service:invalid',
      title: 'Service',
      quantity: 1,
      price: undefined,
      currency: 'EUR',
    })
  })

  it('counts items without price explicitly', () => {
    const items: CartItem[] = [
      { id: '1', title: 'A', quantity: 1, price: 10, currency: 'EUR' },
      { id: '2', title: 'B', quantity: 1 },
      { id: '3', title: 'C', quantity: 1, price: undefined },
    ]

    expect(countItemsWithoutPrice(items)).toBe(2)
  })
})

describe('cart recommendation seed', () => {
  it('uses first numeric product id and skips service/package items', () => {
    const items: CartItem[] = [
      { id: 'abc', title: 'Unknown id', quantity: 1, price: 10, currency: 'EUR' },
      { id: '10:service:laser', title: 'Service', quantity: 1, price: 50, currency: 'EUR' },
      { id: '42', title: 'Product', quantity: 1, price: 20, currency: 'EUR' },
    ]

    expect(getRecommendationSeedProductId(items)).toBe(42)
  })

  it('returns null when no valid numeric product id exists', () => {
    const items: CartItem[] = [
      { id: 'x:service:1', title: 'Service', quantity: 1 },
      { id: 'package:gold', title: 'Package', quantity: 1 },
      { id: 'sku-001', title: 'SKU', quantity: 1 },
    ]

    expect(getRecommendationSeedProductId(items)).toBeNull()
  })
})

describe('cart operations and item kind', () => {
  it('applies increment/decrement/remove operations deterministically', () => {
    const items: CartItem[] = [
      { id: '101', title: 'Product', quantity: 1, price: 20, currency: 'EUR' },
      { id: '10:service:laser', title: 'Service', quantity: 2, price: 80, currency: 'EUR' },
    ]

    const incremented = incrementCartItem(items, '101')
    expect(incremented[0]?.quantity).toBe(2)

    const decremented = decrementCartItem(incremented, '10:service:laser')
    expect(decremented).toHaveLength(2)
    expect(decremented[1]?.quantity).toBe(1)

    const removed = removeCartItem(decremented, '101')
    expect(removed).toHaveLength(1)
    expect(removed[0]?.id).toBe('10:service:laser')
  })

  it('computes subtotal and kind helpers correctly', () => {
    const items: CartItem[] = [
      { id: '101', title: 'Product', quantity: 2, price: 20, currency: 'EUR' },
      { id: '10:service:laser', title: 'Service', quantity: 1, price: 80, currency: 'EUR' },
      { id: '20:package:gold', title: 'Package', quantity: 1, price: 120, currency: 'EUR' },
    ]

    expect(computeSubtotal(items)).toBe(240)
    expect(getCartItemKind(items[0]!)).toBe('product')
    expect(getCartItemKind(items[1]!)).toBe('service')
    expect(getCartItemKind(items[2]!)).toBe('package')
    expect(isServiceLikeCartItem(items[0]!)).toBe(false)
    expect(isServiceLikeCartItem(items[1]!)).toBe(true)
    expect(isServiceLikeCartItem(items[2]!)).toBe(true)
  })
})
