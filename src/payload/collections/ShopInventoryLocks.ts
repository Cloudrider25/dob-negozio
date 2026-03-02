import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ShopInventoryLocks: CollectionConfig = {
  slug: 'shop-inventory-locks',
  admin: {
    useAsTitle: 'lockToken',
    defaultColumns: ['product', 'lockToken', 'expiresAt', 'createdAt'],
    group: 'Vendite',
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'lockToken',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
    },
  ],
  timestamps: true,
}
