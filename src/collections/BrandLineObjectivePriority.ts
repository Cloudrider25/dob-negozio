import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const BrandLineObjectivePriority: CollectionConfig = {
  slug: 'brand-line-objective-priority',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['brandLine', 'objective', 'score'],
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
      name: 'brandLine',
      type: 'relationship',
      relationTo: 'brand-lines',
      required: true,
    },
    {
      name: 'objective',
      type: 'relationship',
      relationTo: 'objectives',
      required: true,
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'note',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
