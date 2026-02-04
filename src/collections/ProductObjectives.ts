import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ProductObjectives: CollectionConfig = {
  slug: 'product-objectives',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'objective'],
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
      name: 'objective',
      type: 'relationship',
      relationTo: 'objectives',
      required: true,
    },
  ],
  timestamps: true,
}
