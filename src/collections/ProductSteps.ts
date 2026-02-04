import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ProductSteps: CollectionConfig = {
  slug: 'product-steps',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'routineStep'],
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
      name: 'routineStep',
      type: 'relationship',
      relationTo: 'routine-steps',
      required: true,
    },
  ],
  timestamps: true,
}
