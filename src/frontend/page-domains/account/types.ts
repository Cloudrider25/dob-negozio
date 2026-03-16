export type AccountSection = 'overview' | 'services' | 'orders' | 'addresses' | 'aesthetic'

export type AddressItem = {
  id: string
  fullName: string
  address: string
  postalCode: string
  city: string
  province: string
  country: string
  firstName?: string
  lastName?: string
  company?: string
  streetAddress?: string
  apartment?: string
  phone?: string
  isDefault?: boolean
}

export type OrderItem = {
  id: number
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  createdAt: string
  purchaseTitle: string
  purchaseThumb: string | null
  otherItemsCount: number
  quantity: number
  unitPrice: number
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  trackingNumber: string | null
  trackingUrl: string | null
  deliveryStatus: string | null
  deliveryUpdatedAt: string | null
}

export type AccountWaitlistItem = {
  id: string
  productId: number
  title: string
  slug: string
  brand: string
  price: number
  currency: string
  format: string
  coverImage: string | null
  status: 'active' | 'notified' | 'cancelled'
  availableNow: boolean
  registeredAt: string | null
  notifiedAt: string | null
}

export type ServiceBookingRow = {
  id: string
  orderServiceItemId: string
  sessionIndex: number
  orderId: number
  orderNumber: string
  orderCreatedAt: string
  orderStatus: string
  paymentStatus: string
  itemKind: 'service' | 'package' | 'program'
  serviceTitle: string
  variantLabel: string
  sessionLabel: string
  sessionsTotal: number
  durationMinutes: number | null
  rowPrice: number
  currency: string
  appointmentMode: string
  appointmentStatus: string
  requestedDate: string | null
  requestedTime: string | null
  proposedDate: string | null
  proposedTime: string | null
  confirmedAt: string | null
}

export type ServicesFilter = 'used' | 'not_used'
export type ServicesSubFilter =
  | 'all'
  | 'requested_date'
  | 'awaiting_confirmation'
  | 'date_to_request'
  | 'confirmed_date'
export type ProductSort = 'newest' | 'oldest' | 'total_desc' | 'total_asc'
export type AddressesView = 'default' | 'book'
