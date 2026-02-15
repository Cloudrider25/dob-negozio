import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Treatments: CollectionConfig = {
  slug: 'treatments',
  admin: {
    useAsTitle: 'boxName',
    defaultColumns: ['boxName', 'active'],
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
      name: 'reference',
      type: 'relationship',
      relationTo: ['objectives', 'areas'],
      hasMany: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'highlightImageLeft',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'highlightImageRight',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'highlightLead',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'highlightPointOneTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'highlightPointOneBody',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'highlightPointTwoTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'highlightPointTwoBody',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'dobGroup',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
