import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'active'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
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
