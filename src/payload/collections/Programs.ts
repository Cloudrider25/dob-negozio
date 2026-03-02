import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'title',
    group: 'Servizi',
    defaultColumns: ['title', 'updatedAt'],
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
        const rawTitle = data.title
        let value = ''
        if (typeof rawTitle === 'string') {
          value = rawTitle
        } else if (rawTitle && typeof rawTitle === 'object') {
          const localized = rawTitle as Record<string, unknown>
          const preferredLocale = req.locale || 'it'
          const preferred = localized[preferredLocale]
          if (typeof preferred === 'string') {
            value = preferred
          } else {
            const first = Object.values(localized).find((item) => typeof item === 'string')
            if (typeof first === 'string') value = first
          }
        }
        if (!value) return data
        const slug = value
          .toLowerCase()
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
        if (slug) {
          data.slug = slug
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'EUR',
      options: [
        { label: 'EUR', value: 'EUR' },
        { label: 'USD', value: 'USD' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroMedia',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'steps',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'stepType',
          type: 'select',
          defaultValue: 'manual',
          options: [
            { label: 'Manuale', value: 'manual' },
            { label: 'Servizio', value: 'service' },
            { label: 'Prodotto', value: 'product' },
          ],
          required: true,
        },
        {
          name: 'stepService',
          label: 'Servizio',
          type: 'relationship',
          relationTo: 'services',
          admin: {
            condition: (_data, siblingData) => siblingData?.stepType === 'service',
            description: 'Media, titolo e sottotitolo vengono presi dal servizio selezionato.',
          },
        },
        {
          name: 'stepProduct',
          label: 'Prodotto',
          type: 'relationship',
          relationTo: 'products',
          admin: {
            condition: (_data, siblingData) => siblingData?.stepType === 'product',
            description: 'Media, titolo e sottotitolo vengono presi dal prodotto selezionato.',
          },
        },
        {
          name: 'stepHeroMedia',
          label: 'Hero / Cover (sinistra)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_data, siblingData) => siblingData?.stepType === 'manual',
          },
        },
        {
          name: 'stepDetailMedia',
          label: 'Media dettaglio (destra)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_data, siblingData) => siblingData?.stepType === 'manual',
          },
        },
        {
          name: 'stepTitle',
          label: 'Titolo step',
          type: 'text',
          localized: true,
          admin: {
            condition: (_data, siblingData) => siblingData?.stepType === 'manual',
          },
        },
        {
          name: 'stepSubtitle',
          label: 'Sottotitolo step',
          type: 'textarea',
          localized: true,
          admin: {
            condition: (_data, siblingData) => siblingData?.stepType === 'manual',
          },
        },
        {
          name: 'stepBadge',
          label: 'Badge step',
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
  timestamps: true,
}
