import type {
  CartItem as StorageCartItem,
  WaitlistItem as StorageWaitlistItem,
} from '@/lib/frontend/cart/storage'

export type CartItemKind = 'product' | 'service' | 'package' | 'program'

export type CartItem = StorageCartItem
export type WaitlistItem = StorageWaitlistItem

export type CartDomainItem = CartItem & {
  kind: CartItemKind
}
