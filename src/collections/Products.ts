import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'price', 'active'],
    group: 'Shop',
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
        let titleValue = ''
        if (typeof rawTitle === 'string') {
          titleValue = rawTitle
        } else if (rawTitle && typeof rawTitle === 'object') {
          const localized = rawTitle as Record<string, unknown>
          const preferredLocale = req.locale || 'it'
          const preferred = localized[preferredLocale]
          if (typeof preferred === 'string') {
            titleValue = preferred
          } else {
            const first = Object.values(localized).find((value) => typeof value === 'string')
            if (typeof first === 'string') titleValue = first
          }
        }
        if (!titleValue) return data
        const slug = slugify(titleValue)
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
          name: 'title',
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
      type: 'tabs',
      tabs: [
        {
          label: 'Generali',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'currency',
                  type: 'select',
                  options: ['EUR'],
                  defaultValue: 'EUR',
                  required: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sku',
                  type: 'text',
                  unique: true,
                },
                {
                  name: 'format',
                  label: 'Formato',
                  type: 'text',
                },
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  required: true,
                },
              ],
            },
            {
              name: 'alternatives',
              label: 'Alternative',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      label: 'Prodotto',
                      type: 'relationship',
                      relationTo: 'products',
                    },
                    {
                      name: 'sku',
                      type: 'text',
                    },
                    {
                      name: 'format',
                      label: 'Formato',
                      type: 'text',
                    },
                    {
                      name: 'price',
                      type: 'number',
                      min: 0,
                    },
                  ],
                },
                {
                  name: 'isRefill',
                  label: 'Is refill',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          label: 'Info',
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
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'brands',
                },
                {
                  name: 'brandLine',
                  type: 'relationship',
                  relationTo: 'brand-lines',
                  filterOptions: ({ data }) => {
                    if (!data?.brand) return true
                    return { brand: { equals: data.brand } }
                  },
                },
              ],
            },
            {
              name: 'isRefill',
              label: 'Is refill',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Gallery',
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 4,
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
              name: 'usage',
              label: "Modo d'uso",
              type: 'textarea',
              localized: true,
            },
            {
              name: 'activeIngredients',
              label: 'Principi attivi',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'results',
              label: 'Risultati',
              type: 'textarea',
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
            {
              name: 'videoPoster',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Sezione Linea',
          fields: [
            {
              name: 'lineSectionTitle',
              type: 'ui',
              label: 'Linea prodotto',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'lineHeadline',
              type: 'text',
              localized: true,
            },
            {
              name: 'lineDetails',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', localized: true },
                    { name: 'value', type: 'textarea', localized: true },
                  ],
                },
              ],
            },
            {
              name: 'lineMedia',
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
              label: "What's included",
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
              admin: {
                description: 'Seleziona un media dalla gallery del prodotto.',
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
              name: 'needs',
              type: 'relationship',
              relationTo: 'needs',
              hasMany: true,
            },
            {
              name: 'skinTypePrimary',
              type: 'relationship',
              relationTo: 'skin-types',
            },
            {
              name: 'skinTypeSecondary',
              type: 'relationship',
              relationTo: 'skin-types',
              hasMany: true,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
            },
            {
              name: 'lines',
              type: 'relationship',
              relationTo: 'lines',
              hasMany: true,
            },
            {
              name: 'textures',
              type: 'relationship',
              relationTo: 'textures',
              hasMany: true,
            },
            {
              name: 'productAreas',
              type: 'relationship',
              relationTo: 'product-areas',
              hasMany: true,
            },
            {
              name: 'timingProducts',
              type: 'relationship',
              relationTo: 'timing-products',
              hasMany: true,
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
                  name: 'stock',
                  type: 'number',
                  defaultValue: 0,
                },
                {
                  name: 'lot',
                  type: 'text',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'expiryDate',
                  type: 'date',
                },
                {
                  name: 'averageCost',
                  type: 'number',
                  min: 0,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'lastCost',
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'residualTotal',
                  type: 'number',
                  min: 0,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'total',
                  type: 'number',
                  min: 0,
                },
              ],
            },
            {
              name: 'metaLine',
              type: 'textarea',
            },
            {
              name: 'metaNeeds',
              type: 'textarea',
            },
            {
              name: 'metaCategories',
              type: 'textarea',
            },
            {
              name: 'metaZones',
              type: 'textarea',
            },
            {
              name: 'metaTexture',
              type: 'textarea',
            },
            {
              name: 'metaDescription',
              type: 'textarea',
            },
            {
              name: 'metaHowToUse',
              type: 'textarea',
            },
            {
              name: 'metaActiveIngredients',
              type: 'textarea',
            },
            {
              name: 'metaResults',
              type: 'textarea',
            },
            {
              name: 'stripeProductId',
              type: 'text',
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
            {
              name: 'stripePriceId',
              type: 'text',
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
