import type { CartItem as StorageCartItem } from '@/lib/cartStorage'

export type CartItemKind = 'product' | 'service' | 'package'

export type CartItem = StorageCartItem

export type CartDomainItem = CartItem & {
  kind: CartItemKind
}
