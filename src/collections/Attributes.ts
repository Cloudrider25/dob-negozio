import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Attributes: CollectionConfig = {
  slug: 'attributes',
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'type', 'active', 'sortOrder'],
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
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'boolean',
      options: [
        { label: 'Boolean', value: 'boolean' },
        { label: 'Enum', value: 'enum' },
        { label: 'Text', value: 'text' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'name',
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
      name: 'values',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'enum',
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
}
