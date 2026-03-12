import type { CartItem, CartItemKind } from './types'

const SERVICE_MARKER = ':service:'
const PACKAGE_MARKER = ':package:'
const PROGRAM_MARKER = ':program:'

export const getCartItemKind = (item: CartItem): CartItemKind => {
  if (item.id.includes(PACKAGE_MARKER)) return 'package'
  if (item.id.includes(SERVICE_MARKER)) return 'service'
  if (item.id.includes(PROGRAM_MARKER)) return 'program'
  return 'product'
}

export const isServiceLikeCartItem = (item: CartItem): boolean => getCartItemKind(item) !== 'product'

export const toDomainCartItem = (item: CartItem) => ({
  ...item,
  kind: getCartItemKind(item),
})
