import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'pageKey',
    defaultColumns: ['pageKey', 'heroTitleMode'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'pageKey',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Services', value: 'services' },
        { label: 'Shop', value: 'shop' },
        { label: 'Journal', value: 'journal' },
        { label: 'Location', value: 'location' },
        { label: 'Our Story', value: 'our-story' },
        { label: 'Contact', value: 'contact' },
      ],
      admin: {
        description: 'Configura solo le pagine esistenti (no categorie).',
      },
    },
    {
      name: 'heroTitleMode',
      type: 'select',
      required: true,
      defaultValue: 'fixed',
      options: [
        { label: 'Fisso', value: 'fixed' },
        { label: 'Dinamico', value: 'dynamic' },
      ],
    },
    {
      name: 'heroStyle',
      type: 'select',
      required: true,
      defaultValue: 'style1',
      options: [
        { label: 'Style 1', value: 'style1' },
        { label: 'Style 2', value: 'style2' },
      ],
    },
    {
      name: 'heroTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroMedia',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 2,
    },
  ],
  timestamps: true,
}
