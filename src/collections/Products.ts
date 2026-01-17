import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'price', 'active'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'brand',
      type: 'text',
      index: true,
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'currency',
      type: 'select',
      options: ['EUR'],
      defaultValue: 'EUR',
      required: true,
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'lot',
      type: 'text',
    },
    {
      name: 'expiryDate',
      type: 'date',
    },
    {
      name: 'averageCost',
      type: 'number',
      min: 0,
    },
    {
      name: 'lastCost',
      type: 'number',
      min: 0,
    },
    {
      name: 'residualTotal',
      type: 'number',
      min: 0,
    },
    {
      name: 'total',
      type: 'number',
      min: 0,
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'stripeProductId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
