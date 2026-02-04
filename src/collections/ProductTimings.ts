import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ProductTimings: CollectionConfig = {
  slug: 'product-timings',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'timing'],
    group: 'Shop',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'timing',
      type: 'relationship',
      relationTo: 'timing-products',
      required: true,
    },
  ],
  timestamps: true,
}
