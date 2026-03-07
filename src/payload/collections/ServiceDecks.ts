import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const getPrimaryLocalizedText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    if (typeof localized.it === 'string' && localized.it.trim()) return localized.it
    const first = Object.values(localized).find(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
    )
    if (first) return first
  }
  return ''
}

export const ServiceDecks: CollectionConfig = {
  slug: 'service-decks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'deckType', 'sortOrder', 'active'],
    group: 'Servizi',
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
        if (slug) data.slug = slug

        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'deckType',
          type: 'select',
          required: true,
          defaultValue: 'laser',
          options: [
            { label: 'Laser', value: 'laser' },
            { label: 'Ceretta', value: 'wax' },
            { label: 'Altro', value: 'other' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Deck Cover',
          fields: [
            {
              name: 'coverTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'coverSubtitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Deck SEO Notes',
          fields: [
            {
              name: 'internalDescription',
              type: 'textarea',
              localized: true,
            },
          ],
        },
      ],
    },
  ],
}
