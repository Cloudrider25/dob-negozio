import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Textures: CollectionConfig = {
  slug: 'textures',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Catalogo Shop',
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
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
