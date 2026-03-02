import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const Needs: CollectionConfig = {
  slug: 'needs',
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
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data || data.slug) return data
        const rawName = data.name
        let nameValue = ''
        if (typeof rawName === 'string') {
          nameValue = rawName
        } else if (rawName && typeof rawName === 'object') {
          const localized = rawName as Record<string, unknown>
          const preferredLocale = req.locale || 'it'
          const preferred = localized[preferredLocale]
          if (typeof preferred === 'string') {
            nameValue = preferred
          } else {
            const first = Object.values(localized).find((value) => typeof value === 'string')
            if (typeof first === 'string') nameValue = first
          }
        }
        if (!nameValue) return data
        const slug = slugify(nameValue)
        if (slug) {
          data.slug = slug
        }
        return data
      },
    ],
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
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
