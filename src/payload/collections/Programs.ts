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

const toRelationId = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return null
}

const toPrice = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object' && 'price' in value) {
    const price = (value as { price?: unknown }).price
    if (typeof price === 'number' && Number.isFinite(price)) return price
  }
  return null
}

const roundCurrency = (value: number) => Number(value.toFixed(2))

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

        const source = {
          ...(originalDoc && typeof originalDoc === 'object' ? originalDoc : {}),
          ...data,
        } as {
          steps?: Array<Record<string, unknown>>
          discountType?: 'percent' | 'amount' | null
          discountValue?: number | null
        }

        const steps = Array.isArray(source.steps) ? source.steps : []
        const priceCache = new Map<string, number | null>()

        const resolveDocPrice = async (
          collection: 'services' | 'products',
          stepValue: unknown,
        ): Promise<number | null> => {
          const inlinePrice = toPrice(stepValue)
          if (inlinePrice !== null) return inlinePrice

          const relationId = toRelationId(stepValue)
          if (!relationId) return null

          const cacheKey = `${collection}:${String(relationId)}`
          if (priceCache.has(cacheKey)) {
            return priceCache.get(cacheKey) ?? null
          }

          const doc = await req.payload.findByID({
            collection,
            id: String(relationId),
            depth: 0,
            req,
          })

          const resolvedPrice = toPrice(doc)
          priceCache.set(cacheKey, resolvedPrice)
          return resolvedPrice
        }

        const stepPrices = await Promise.all(
          steps.map(async (step) => {
            if (!step || typeof step !== 'object') return null
            if (step.stepType === 'service') {
              return resolveDocPrice('services', step.stepService)
            }
            if (step.stepType === 'product') {
              return resolveDocPrice('products', step.stepProduct)
            }
            return null
          }),
        )

        const basePrice = roundCurrency(
          stepPrices.reduce<number>((sum, price) => {
            if (typeof price !== 'number' || Number.isNaN(price) || price < 0) return sum
            return sum + price
          }, 0),
        )

        const discountType = source.discountType === 'amount' ? 'amount' : 'percent'
        const rawDiscountValue =
          typeof source.discountValue === 'number' && Number.isFinite(source.discountValue)
            ? source.discountValue
            : 0
        const discountValue = rawDiscountValue < 0 ? 0 : rawDiscountValue

        const discountAmount =
          discountType === 'amount'
            ? discountValue
            : (basePrice * Math.min(discountValue, 100)) / 100

        data.basePrice = basePrice
        data.discountType = discountType
        data.discountValue = roundCurrency(discountValue)
        data.price = roundCurrency(Math.max(basePrice - discountAmount, 0))

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
              name: 'active',
              type: 'checkbox',
              defaultValue: true,
            },
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
                    description: 'Calcolato automaticamente dagli step del programma al salvataggio.',
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
                    description:
                      'Calcolato automaticamente da somma elementi meno sconto al salvataggio.',
                    components: {
                      Field: '/admin/components/ProgramComputedPriceField',
                    },
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
