import type { CartItem as StorageCartItem } from '@/lib/frontend/cart/storage'

export type CartItemKind = 'product' | 'service' | 'package' | 'program'

export type CartItem = StorageCartItem

export type CartDomainItem = CartItem & {
  kind: CartItemKind
}
