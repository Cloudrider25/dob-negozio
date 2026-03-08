import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const normalizePromoCode = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : ''

export const PromoCodes: CollectionConfig = {
  slug: 'promo-codes',
  labels: {
    singular: 'Promo Code',
    plural: 'Promo Codes',
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'partner', 'discountType', 'discountValue', 'active', 'startsAt', 'endsAt'],
    group: 'Marketing',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        const normalizedCode = normalizePromoCode(data.code)
        if (normalizedCode) {
          data.code = normalizedCode
        }

        const appliesToProducts = data.appliesToProducts !== false
        const appliesToServices = data.appliesToServices !== false

        if (!appliesToProducts && !appliesToServices) {
          throw new Error('Il promo code deve applicarsi almeno a prodotti o servizi.')
        }

        if (
          typeof data.startsAt === 'string' &&
          typeof data.endsAt === 'string' &&
          data.startsAt &&
          data.endsAt &&
          new Date(data.startsAt).getTime() > new Date(data.endsAt).getTime()
        ) {
          throw new Error('La data di fine non puo essere precedente alla data di inizio.')
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'code',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  admin: {
                    description: 'Salvato sempre in uppercase per garantire unicita globale.',
                  },
                },
                {
                  name: 'active',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
            {
              name: 'internalLabel',
              type: 'text',
            },
            {
              name: 'partner',
              type: 'relationship',
              relationTo: 'users',
              required: true,
              filterOptions: {
                roles: {
                  contains: 'partner',
                },
              },
              admin: {
                description: 'Seleziona un utente con ruolo partner.',
              },
            },
            {
              name: 'notes',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Discount',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'discountType',
                  type: 'select',
                  options: [
                    { label: 'Percentuale', value: 'percent' },
                    { label: 'Importo fisso', value: 'amount' },
                  ],
                  required: true,
                },
                {
                  name: 'discountValue',
                  type: 'number',
                  min: 0,
                  required: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'commissionType',
                  type: 'select',
                  options: [
                    { label: 'Percentuale', value: 'percent' },
                    { label: 'Importo fisso', value: 'amount' },
                  ],
                  required: true,
                },
                {
                  name: 'commissionValue',
                  type: 'number',
                  min: 0,
                  required: true,
                  admin: {
                    description: 'La commissione viene sempre calcolata sul netto dopo sconto.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Rules',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'appliesToProducts',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'appliesToServices',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'endsAt',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'usageLimit',
                  type: 'number',
                  min: 1,
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
