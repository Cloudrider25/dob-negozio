import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const CheckoutAttempts: CollectionConfig = {
  slug: 'checkout-attempts',
  labels: {
    singular: 'Checkout Attempt',
    plural: 'Checkout Attempts',
  },
  admin: {
    useAsTitle: 'checkoutFingerprint',
    defaultColumns: ['checkoutFingerprint', 'status', 'customerEmail', 'total', 'createdAt'],
    group: 'Sistema',
    hidden: true,
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'checkoutFingerprint',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'cartSignature',
      type: 'text',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: ['pending', 'paid', 'failed', 'cancelled', 'expired', 'converted'],
          index: true,
        },
        {
          name: 'paymentProvider',
          type: 'text',
          required: true,
          defaultValue: 'stripe',
        },
        {
          name: 'paymentReference',
          type: 'text',
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'locale',
          type: 'select',
          required: true,
          options: ['it', 'en', 'ru'],
          defaultValue: 'it',
        },
        {
          name: 'expiresAt',
          type: 'date',
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'customerEmail',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'customerPhone',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerFirstName',
          type: 'text',
        },
        {
          name: 'customerLastName',
          type: 'text',
        },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'json',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'productFulfillmentMode',
          type: 'select',
          required: true,
          defaultValue: 'none',
          options: ['shipping', 'pickup', 'none'],
        },
        {
          name: 'appointmentMode',
          type: 'select',
          required: true,
          defaultValue: 'none',
          options: ['requested_slot', 'contact_later', 'none'],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentRequestedDate',
          type: 'date',
        },
        {
          name: 'appointmentRequestedTime',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          min: 0,
        },
        {
          name: 'shippingAmount',
          type: 'number',
          min: 0,
        },
        {
          name: 'discountAmount',
          type: 'number',
          min: 0,
        },
        {
          name: 'commissionAmount',
          type: 'number',
          min: 0,
        },
        {
          name: 'total',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'promoCode',
          type: 'relationship',
          relationTo: 'promo-codes',
        },
        {
          name: 'partner',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'promoCodeValue',
          type: 'text',
        },
      ],
    },
    {
      name: 'promoCodeSnapshot',
      type: 'json',
    },
    {
      name: 'itemsSnapshot',
      type: 'json',
      required: true,
    },
    {
      name: 'productItems',
      type: 'json',
    },
    {
      name: 'serviceItems',
      type: 'json',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'inventoryReserved',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'inventoryReleased',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
        },
        {
          name: 'convertedAt',
          type: 'date',
        },
      ],
    },
  ],
  timestamps: true,
}
