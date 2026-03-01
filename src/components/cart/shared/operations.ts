import type { CartItem } from './types'

export const incrementCartItem = (items: CartItem[], id: string): CartItem[] =>
  items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))

export const decrementCartItem = (items: CartItem[], id: string): CartItem[] =>
  items
    .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0)

export const removeCartItem = (items: CartItem[], id: string): CartItem[] =>
  items.filter((item) => item.id !== id)

export const computeSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)

export const computeItemCount = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0)
