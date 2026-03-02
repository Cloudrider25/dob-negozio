import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const BrandLineNeedsPriority: CollectionConfig = {
  slug: 'brand-line-needs-priority',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['brandLine', 'need', 'score'],
    group: 'Routine Engine',
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
      name: 'need',
      type: 'relationship',
      relationTo: 'needs',
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
