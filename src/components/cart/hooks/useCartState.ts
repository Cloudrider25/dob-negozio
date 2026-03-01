'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  readCart,
  writeCart,
} from '@/lib/cartStorage'

import type { CartItem } from '../shared/types'
import {
  computeItemCount,
  computeSubtotal,
  decrementCartItem,
  incrementCartItem,
  removeCartItem,
} from '../shared/operations'
import { normalizeCartItems } from '../shared/normalize'

type UseCartStateResult = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  reloadCart: () => void
  setCartItems: (next: CartItem[]) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  removeItem: (id: string) => void
}

export const useCartState = (): UseCartStateResult => {
  const [items, setItems] = useState<CartItem[]>([])

  const reloadCart = useCallback(() => {
    const rawItems = readCart()
    const normalizedItems = normalizeCartItems(rawItems)
    setItems(normalizedItems)
    if (typeof window !== 'undefined' && JSON.stringify(rawItems) !== JSON.stringify(normalizedItems)) {
      writeCart(normalizedItems)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    reloadCart()
    window.addEventListener(CART_UPDATED_EVENT, reloadCart)
    window.addEventListener('storage', reloadCart)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, reloadCart)
      window.removeEventListener('storage', reloadCart)
    }
  }, [reloadCart])

  const setCartItems = useCallback((next: CartItem[]) => {
    const normalizedItems = normalizeCartItems(next)
    setItems(normalizedItems)
    if (typeof window !== 'undefined') {
      writeCart(normalizedItems)
      emitCartUpdated()
    }
  }, [])

  const incrementItem = useCallback(
    (id: string) => {
      setCartItems(incrementCartItem(items, id))
    },
    [items, setCartItems],
  )

  const decrementItem = useCallback(
    (id: string) => {
      setCartItems(decrementCartItem(items, id))
    },
    [items, setCartItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setCartItems(removeCartItem(items, id))
    },
    [items, setCartItems],
  )

  const subtotal = useMemo(() => computeSubtotal(items), [items])
  const itemCount = useMemo(() => computeItemCount(items), [items])

  return {
    items,
    itemCount,
    subtotal,
    reloadCart,
    setCartItems,
    incrementItem,
    decrementItem,
    removeItem,
  }
}
