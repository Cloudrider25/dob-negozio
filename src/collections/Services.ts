import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'serviceType', 'price', 'duration', 'active'],
    group: 'Servizi',
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
      name: 'category',
      type: 'relationship',
      relationTo: 'treatments',
      required: true,
    },
    {
      name: 'treatments',
      type: 'relationship',
      relationTo: 'treatments',
      hasMany: true,
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
      name: 'price',
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      localized: true,
      admin: {
        description: 'Es. 60 min',
      },
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      defaultValue: 'single',
      options: [
        { label: 'Singolo', value: 'single' },
        { label: 'Pacchetto', value: 'package' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
