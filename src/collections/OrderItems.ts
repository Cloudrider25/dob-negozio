import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const OrderItems: CollectionConfig = {
  slug: 'order-items',
  admin: {
    useAsTitle: 'productTitle',
    defaultColumns: ['order', 'productTitle', 'quantity', 'unitPrice', 'lineTotal'],
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'productTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'productSlug',
      type: 'text',
    },
    {
      name: 'productBrand',
      type: 'text',
    },
    {
      name: 'productCoverImage',
      type: 'text',
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
