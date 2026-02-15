import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Objectives: CollectionConfig = {
  slug: 'objectives',
  admin: {
    useAsTitle: 'boxName',
    defaultColumns: ['boxName', 'area'],
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
      name: 'boxName',
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
      name: 'cardName',
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
    {
      name: 'area',
      type: 'relationship',
      relationTo: 'areas',
      required: true,
    },
  ],
  timestamps: true,
}
