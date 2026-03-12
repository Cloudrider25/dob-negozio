import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { seoFields } from '../fields/seoFields'

const slugifyValue = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const resolveNumeric = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

const clampMoney = (value: number) => Math.max(0, Number(value.toFixed(2)))

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'title',
    group: 'Servizi',
    defaultColumns: ['title', 'active', 'price', 'updatedAt'],
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
        const slug = slugifyValue(value)
        if (slug) {
          data.slug = slug
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        const steps = Array.isArray(data.steps)
          ? data.steps
          : Array.isArray(originalDoc?.steps)
            ? originalDoc.steps
            : []

        let basePrice = 0

        for (const step of steps) {
          if (!step || typeof step !== 'object') continue

          if (step.stepType === 'service' && step.stepService) {
            const service = await req.payload.findByID({
              collection: 'services',
              id:
                typeof step.stepService === 'object' && step.stepService && 'id' in step.stepService
                  ? String(step.stepService.id)
                  : String(step.stepService),
              depth: 0,
              overrideAccess: false,
              req,
            })
            basePrice += resolveNumeric(service?.price)
          }

          if (step.stepType === 'product' && step.stepProduct) {
            const product = await req.payload.findByID({
              collection: 'products',
              id:
                typeof step.stepProduct === 'object' && step.stepProduct && 'id' in step.stepProduct
                  ? String(step.stepProduct.id)
                  : String(step.stepProduct),
              depth: 0,
              overrideAccess: false,
              req,
            })
            basePrice += resolveNumeric(product?.price)
          }
        }

        const nextBasePrice = clampMoney(basePrice)
        const discountType =
          data.discountType ??
          originalDoc?.discountType ??
          'percent'
        const discountValue = resolveNumeric(data.discountValue ?? originalDoc?.discountValue)

        let finalPrice = nextBasePrice
        if (discountType === 'amount') {
          finalPrice = nextBasePrice - discountValue
        } else {
          finalPrice = nextBasePrice - nextBasePrice * (discountValue / 100)
        }

        data.basePrice = nextBasePrice
        data.discountValue = clampMoney(discountValue)
        data.price = clampMoney(finalPrice)

        return data
      },
    ],
  },
  fields: [
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
      type: 'tabs',
      tabs: [
        {
          label: 'SEO',
          fields: [...seoFields],
        },
        {
          label: 'Programma Generale',
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
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
              label: 'Hero Media',
            },
          ],
        },
        {
          label: 'Programma Builder',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'basePrice',
                  label: 'Somma elementi',
                  type: 'number',
                  min: 0,
                  admin: {
                    readOnly: true,
                    description: 'Calcolato automaticamente dalla somma degli elementi nel programma.',
                  },
                },
                {
                  name: 'discountType',
                  label: 'Tipo sconto',
                  type: 'select',
                  defaultValue: 'percent',
                  options: [
                    { label: 'Percentuale', value: 'percent' },
                    { label: 'Fisso', value: 'amount' },
                  ],
                  required: true,
                },
                {
                  name: 'discountValue',
                  label: 'Valore sconto',
                  type: 'number',
                  min: 0,
                  defaultValue: 0,
                },
                {
                  name: 'price',
                  label: 'Nuovo prezzo',
                  type: 'number',
                  min: 0,
                  admin: {
                    readOnly: true,
                    description: 'Calcolato automaticamente in base allo sconto impostato.',
                  },
                },
              ],
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
        },
      ],
    },
  ],
  timestamps: true,
}
