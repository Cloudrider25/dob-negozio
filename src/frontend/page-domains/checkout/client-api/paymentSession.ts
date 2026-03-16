import type { CartItem } from '@/lib/frontend/cart/storage'
import { hasCheckoutEligibleItems } from '@/lib/frontend/cart/checkoutEligibility'
import type { CustomerSnapshot, PaymentSession } from '@/frontend/page-domains/checkout/shared/contracts'
import { buildCheckoutSubmitPayload } from '@/frontend/page-domains/checkout/shared/checkout-submit'

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
    discountCode,
    productFulfillmentMode,
    serviceAppointmentMode,
    serviceRequestedDate,
    serviceRequestedTime,
  })

  if (!hasCheckoutEligibleItems(items) || payload.items.length === 0) {
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
    attemptId?: string | number
    orderNumber?: string
    orderId?: string | number
    quote?: {
      subtotal?: number
      shippingAmount?: number
      discountAmount?: number
      commissionAmount?: number
      total?: number
      currency?: string
    }
    total?: number
    discountAmount?: number
    currency?: string
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
      attemptId: data.attemptId,
      orderNumber: data.orderNumber,
      orderId: data.orderId,
      quote:
        data.quote &&
        typeof data.quote.subtotal === 'number' &&
        typeof data.quote.shippingAmount === 'number' &&
        typeof data.quote.discountAmount === 'number' &&
        typeof data.quote.commissionAmount === 'number' &&
        typeof data.quote.total === 'number' &&
        typeof data.quote.currency === 'string'
          ? {
              subtotal: data.quote.subtotal,
              shippingAmount: data.quote.shippingAmount,
              discountAmount: data.quote.discountAmount,
              commissionAmount: data.quote.commissionAmount,
              total: data.quote.total,
              currency: data.quote.currency,
            }
          : undefined,
      totalAmount: typeof data.total === 'number' ? data.total : undefined,
      discountAmount: typeof data.discountAmount === 'number' ? data.discountAmount : undefined,
      currency: typeof data.currency === 'string' ? data.currency : undefined,
    }
  }

  throw new CheckoutSessionError('checkout_response_invalid')
}
