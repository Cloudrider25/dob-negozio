import type { CartItem } from '@/lib/frontend/cart/storage'
import type { CustomerSnapshot } from '@/frontend/page-domains/checkout/shared/contracts'

type ProductFulfillmentMode = 'shipping' | 'pickup' | 'none'
type ServiceAppointmentMode = 'requested_slot' | 'contact_later' | 'none'

export type CheckoutSubmitPayload = {
  checkoutMode: 'payment_element'
  locale: string
  discountCode?: string
  customer: CustomerSnapshot
  items: Array<{ id: string; quantity: number }>
  shippingOptionID?: string
  productFulfillmentMode: ProductFulfillmentMode
  serviceAppointment:
    | {
        mode: 'requested_slot'
        requestedDate: string
        requestedTime: string
      }
    | {
        mode: 'contact_later' | 'none'
      }
}

const isServiceLikeId = (id: string) =>
  id.includes(':service:') || id.includes(':package:') || id.includes(':program:')

export const buildCheckoutSubmitPayload = ({
  locale,
  customer,
  items,
  shippingOptionID,
  discountCode,
  productFulfillmentMode,
  serviceAppointmentMode,
  serviceRequestedDate,
  serviceRequestedTime,
}: {
  locale: string
  customer: CustomerSnapshot
  items: CartItem[]
  shippingOptionID: string | null
  discountCode?: string | null
  productFulfillmentMode: ProductFulfillmentMode
  serviceAppointmentMode: 'requested_slot' | 'contact_later'
  serviceRequestedDate: string
  serviceRequestedTime: string
}): CheckoutSubmitPayload => {
  const normalizedItems = items
    .map((item) => ({
      id: String(item.id || '').trim(),
      quantity: Number.isFinite(item.quantity) ? Math.max(1, Math.floor(item.quantity)) : 1,
    }))
    .filter((item) => item.id.length > 0)

  const hasProducts = normalizedItems.some((item) => !isServiceLikeId(item.id))
  const hasServices = normalizedItems.some((item) => isServiceLikeId(item.id))

  const normalizedFulfillmentMode: ProductFulfillmentMode = hasProducts
    ? productFulfillmentMode === 'pickup'
      ? 'pickup'
      : 'shipping'
    : 'none'

  const requestedDate = serviceRequestedDate.trim()
  const requestedTime = serviceRequestedTime.trim()

  const normalizedServiceMode: ServiceAppointmentMode = hasServices
    ? serviceAppointmentMode === 'requested_slot' && requestedDate && requestedTime
      ? 'requested_slot'
      : 'contact_later'
    : 'none'

  const serviceAppointment =
    normalizedServiceMode === 'requested_slot'
      ? {
          mode: 'requested_slot' as const,
          requestedDate,
          requestedTime,
        }
      : {
          mode: normalizedServiceMode,
        }

  return {
    checkoutMode: 'payment_element',
    locale,
    ...(typeof discountCode === 'string' && discountCode.trim().length > 0
      ? { discountCode: discountCode.trim() }
      : {}),
    customer,
    items: normalizedItems,
    productFulfillmentMode: normalizedFulfillmentMode,
    ...(normalizedFulfillmentMode === 'shipping' && shippingOptionID
      ? { shippingOptionID }
      : {}),
    serviceAppointment,
  }
}
