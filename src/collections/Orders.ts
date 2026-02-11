import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const createOrderNumber = () => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `DOB-${y}${m}${d}-${random}`
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'paymentStatus', 'customerEmail', 'total', 'createdAt'],
    group: 'Shop',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data
        if (operation !== 'create') return data
        if (!data.orderNumber) {
          data.orderNumber = createOrderNumber()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'fulfilled'],
        },
        {
          name: 'paymentStatus',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: ['pending', 'paid', 'failed', 'refunded'],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentProvider',
          type: 'text',
          required: true,
          defaultValue: 'manual',
        },
        {
          name: 'paymentReference',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'currency',
          type: 'text',
          required: true,
          defaultValue: 'EUR',
        },
        {
          name: 'locale',
          type: 'text',
          required: true,
          defaultValue: 'it',
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
          required: true,
        },
        {
          name: 'shippingAmount',
          type: 'number',
          min: 0,
          required: true,
          defaultValue: 0,
        },
        {
          name: 'discountAmount',
          type: 'number',
          min: 0,
          required: true,
          defaultValue: 0,
        },
        {
          name: 'total',
          type: 'number',
          min: 0,
          required: true,
        },
      ],
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerFirstName',
          type: 'text',
          required: true,
        },
        {
          name: 'customerLastName',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'customerPhone',
      type: 'text',
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          required: true,
        },
        {
          name: 'postalCode',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'province',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          defaultValue: 'Italy',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
