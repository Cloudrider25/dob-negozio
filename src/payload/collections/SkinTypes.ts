import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const SkinTypes: CollectionConfig = {
  slug: 'skin-types',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'productArea'],
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
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
  timestamps: true,
}
