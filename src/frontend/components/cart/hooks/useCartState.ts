'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  readCart,
  readWaitlist,
  writeCart,
  writeWaitlist,
} from '@/lib/frontend/cart/storage'

import type { CartItem, WaitlistItem } from '../shared/types'
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
  waitlistItems: WaitlistItem[]
  itemCount: number
  waitlistCount: number
  totalCount: number
  subtotal: number
  reloadCart: () => void
  setCartItems: (next: CartItem[]) => void
  setWaitlistItems: (next: WaitlistItem[]) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  removeItem: (id: string) => void
  removeWaitlistItem: (id: string) => void
}

export const useCartState = (): UseCartStateResult => {
  const [items, setItems] = useState<CartItem[]>([])
  const [waitlistItems, setWaitlist] = useState<WaitlistItem[]>([])

  const reloadCart = useCallback(() => {
    const rawItems = readCart()
    const normalizedItems = normalizeCartItems(rawItems)
    const rawWaitlistItems = readWaitlist()
    setItems(normalizedItems)
    setWaitlist(rawWaitlistItems)
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

  const setWaitlistItems = useCallback((next: WaitlistItem[]) => {
    setWaitlist(next)
    if (typeof window !== 'undefined') {
      writeWaitlist(next)
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

  const removeWaitlistItem = useCallback(
    (id: string) => {
      setWaitlistItems(waitlistItems.filter((item) => item.id !== id))
    },
    [setWaitlistItems, waitlistItems],
  )

  const subtotal = useMemo(() => computeSubtotal(items), [items])
  const itemCount = useMemo(() => computeItemCount(items), [items])
  const waitlistCount = useMemo(() => waitlistItems.length, [waitlistItems])
  const totalCount = itemCount + waitlistCount

  return {
    items,
    waitlistItems,
    itemCount,
    waitlistCount,
    totalCount,
    subtotal,
    reloadCart,
    setCartItems,
    setWaitlistItems,
    incrementItem,
    decrementItem,
    removeItem,
    removeWaitlistItem,
  }
}
