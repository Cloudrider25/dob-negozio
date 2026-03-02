export const FREE_SHIPPING_THRESHOLD_EUR = 70

export const isFreeShippingUnlocked = (subtotal: number): boolean =>
  Number.isFinite(subtotal) && subtotal >= FREE_SHIPPING_THRESHOLD_EUR

export const getRemainingForFreeShipping = (subtotal: number): number =>
  Math.max(0, FREE_SHIPPING_THRESHOLD_EUR - (Number.isFinite(subtotal) ? subtotal : 0))

