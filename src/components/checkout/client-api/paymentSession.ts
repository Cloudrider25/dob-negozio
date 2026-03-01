import type { CartItem } from '@/lib/cartStorage'
import type { CustomerSnapshot, PaymentSession } from '@/components/checkout/shared/contracts'
import { buildCheckoutSubmitPayload } from '@/components/checkout/shared/checkout-submit'

export class CheckoutSessionError extends Error {
  status?: number
  missing?: string[]
  requested?: number
  available?: number
}

export const createPaymentElementSession = async ({
  locale,
  customer,
  items,
  shippingOptionID,
  productFulfillmentMode,
  serviceAppointmentMode,
  serviceRequestedDate,
  serviceRequestedTime,
}: {
  locale: string
  customer: CustomerSnapshot
  items: CartItem[]
  shippingOptionID: string | null
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  serviceAppointmentMode: 'requested_slot' | 'contact_later'
  serviceRequestedDate: string
  serviceRequestedTime: string
}): Promise<PaymentSession> => {
  const payload = buildCheckoutSubmitPayload({
    locale,
    customer,
    items,
    shippingOptionID,
    productFulfillmentMode,
    serviceAppointmentMode,
    serviceRequestedDate,
    serviceRequestedTime,
  })

  if (payload.items.length === 0) {
    throw new CheckoutSessionError('checkout_empty_cart')
  }

  const response = await fetch('/api/shop/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as {
    error?: string
    orderNumber?: string
    orderId?: string | number
    paymentIntentClientSecret?: string | null
    stripePublishableKey?: string | null
    checkoutMode?: 'redirect' | 'payment_element'
    missing?: string[]
    requested?: number
    available?: number
  }

  if (!response.ok) {
    const error = new CheckoutSessionError(data.error || 'checkout_failed')
    error.status = response.status
    error.missing = data.missing
    error.requested = data.requested
    error.available = data.available
    throw error
  }

  if (
    data.checkoutMode === 'payment_element' &&
    typeof data.paymentIntentClientSecret === 'string' &&
    data.paymentIntentClientSecret.length > 0 &&
    typeof data.stripePublishableKey === 'string' &&
    data.stripePublishableKey.length > 0
  ) {
    return {
      clientSecret: data.paymentIntentClientSecret,
      publishableKey: data.stripePublishableKey,
      orderNumber: data.orderNumber,
      orderId: data.orderId,
    }
  }

  throw new CheckoutSessionError('checkout_response_invalid')
}
