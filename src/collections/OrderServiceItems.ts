import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const OrderServiceItems: CollectionConfig = {
  slug: 'order-service-items',
  admin: {
    useAsTitle: 'serviceTitle',
    defaultColumns: ['order', 'serviceTitle', 'itemKind', 'quantity', 'unitPrice', 'lineTotal'],
    group: 'Vendite',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'itemKind',
          type: 'select',
          required: true,
          defaultValue: 'service',
          options: [
            { label: 'Service', value: 'service' },
            { label: 'Package', value: 'package' },
          ],
        },
        {
          name: 'variantKey',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'variantLabel',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'serviceTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'serviceSlug',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'durationMinutes',
          type: 'number',
          min: 0,
        },
        {
          name: 'sessions',
          type: 'number',
          min: 1,
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
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'lineTotal',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
  ],
  timestamps: true,
}

