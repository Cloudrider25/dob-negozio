import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Areas: CollectionConfig = {
  slug: 'areas',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
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
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
    },
    {
      name: 'boxTagline',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'cardTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'cardTagline',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'cardMedia',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'cardDescription',
      type: 'richText',
      localized: true,
    },
  ],
  timestamps: true,
}
