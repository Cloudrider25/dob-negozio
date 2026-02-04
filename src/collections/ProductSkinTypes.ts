import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ProductSkinTypes: CollectionConfig = {
  slug: 'product-skin-types',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'skinType'],
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
      name: 'skinType',
      type: 'relationship',
      relationTo: 'skin-types',
      required: true,
    },
  ],
  timestamps: true,
}
