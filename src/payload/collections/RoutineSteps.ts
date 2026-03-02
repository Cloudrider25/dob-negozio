import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const RoutineSteps: CollectionConfig = {
  slug: 'routine-steps',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'productArea', 'stepOrderDefault', 'active'],
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
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'productArea',
      type: 'relationship',
      relationTo: 'product-areas',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'stepOrderDefault',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isOptionalDefault',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isSystem',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
