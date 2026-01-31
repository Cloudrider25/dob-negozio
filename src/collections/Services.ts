import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'serviceType', 'price', 'duration', 'active'],
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
        if (slug) {
          data.slug = slug
        }
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
      name: 'legacyName',
      type: 'text',
      admin: {
        hidden: true,
      },
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
      type: 'tabs',
      tabs: [
        {
          label: 'Generali',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  required: true,
                },
                {
                  name: 'durationMinutes',
                  type: 'number',
                  min: 0,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'serviceType',
                  type: 'select',
                  required: true,
                  defaultValue: 'single',
                  options: [
                    { label: 'Singolo', value: 'single' },
                    { label: 'Pacchetto', value: 'package' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Gallery',
          fields: [
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'isCover',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'mediaType',
                      type: 'select',
                      options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Video', value: 'video' },
                      ],
                      defaultValue: 'image',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sezione 1',
          fields: [
            {
              name: 'heroAccordionTitle',
              type: 'ui',
              label: 'Hero + Accordion',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'tagline', type: 'text', localized: true },
                {
                  name: 'badge',
                  type: 'relationship',
                  relationTo: 'badges',
                },
              ],
            },
            {
              name: 'results',
              type: 'richText',
              localized: true,
              label: 'Benefits / Results',
            },
            {
              name: 'indications',
              type: 'richText',
              localized: true,
              label: 'Areas & Use Cases',
            },
            {
              name: 'techProtocolShort',
              type: 'richText',
              localized: true,
            },
            {
              name: 'downtime',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Sezione 2',
          fields: [
            {
              name: 'videoSectionTitle',
              type: 'ui',
              label: 'Video',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'videoEmbedUrl',
              type: 'text',
              admin: {
                description: 'URL embed (YouTube/Vimeo)',
              },
            },
            {
              name: 'videoUpload',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Sezione 3',
          fields: [
            {
              name: 'includedSectionTitle',
              type: 'ui',
              label: 'What’s included',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'includedMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: ({ siblingData }) => {
                const gallery = (siblingData as { gallery?: unknown })?.gallery
                if (!Array.isArray(gallery)) return false
                const ids = gallery
                  .map((item) => item?.media)
                  .map((media) => {
                    if (typeof media === 'string' || typeof media === 'number') return media
                    if (media && typeof media === 'object' && 'id' in media) {
                      return (media as { id?: string | number }).id
                    }
                    return null
                  })
                  .filter(Boolean)
                if (!ids.length) return false
                return { id: { in: ids } }
              },
              admin: {
                description: 'Seleziona un media dalla gallery del servizio.',
              },
            },
            {
              name: 'includedDescription',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Sezione 4',
          fields: [
            {
              name: 'faqSectionTitle',
              type: 'ui',
              label: 'FAQ',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'faqMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: ({ siblingData }) => {
                const gallery = (siblingData as { gallery?: unknown })?.gallery
                if (!Array.isArray(gallery)) return false
                const ids = gallery
                  .map((item) => item?.media)
                  .map((media) => {
                    if (typeof media === 'string' || typeof media === 'number') return media
                    if (media && typeof media === 'object' && 'id' in media) {
                      return (media as { id?: string | number }).id
                    }
                    return null
                  })
                  .filter(Boolean)
                if (!ids.length) return false
                return { id: { in: ids } }
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'faqTitle', type: 'text', localized: true },
                { name: 'faqSubtitle', type: 'text', localized: true },
              ],
            },
            {
              name: 'faqItems',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'q', type: 'text', localized: true },
                    { name: 'a', type: 'textarea', localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Relazioni',
          fields: [
            {
              name: 'treatments',
              type: 'relationship',
              relationTo: 'treatments',
              hasMany: true,
              required: true,
            },
            {
              name: 'treatment',
              type: 'relationship',
              relationTo: 'treatments',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'objective',
              type: 'relationship',
              relationTo: 'objectives',
            },
            {
              name: 'area',
              type: 'relationship',
              relationTo: 'areas',
            },
            {
              name: 'intent',
              type: 'relationship',
              relationTo: 'intents',
            },
            {
              name: 'zone',
              type: 'relationship',
              relationTo: 'zones',
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'gender',
                  type: 'select',
                  options: [
                    { label: 'Unisex', value: 'unisex' },
                    { label: 'Donna', value: 'female' },
                    { label: 'Uomo', value: 'male' },
                  ],
                },
                {
                  name: 'modality',
                  type: 'select',
                  options: [
                    { label: 'Device', value: 'device' },
                    { label: 'Manual', value: 'manual' },
                    { label: 'Laser', value: 'laser' },
                    { label: 'Consultation', value: 'consultation' },
                    { label: 'Wax', value: 'wax' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'intentCode', type: 'text' },
                { name: 'zoneCode', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
