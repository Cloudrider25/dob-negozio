import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const OrderServiceItems: CollectionConfig = {
  slug: 'order-service-items',
  admin: {
    useAsTitle: 'serviceTitle',
    defaultColumns: ['order', 'serviceTitle', 'itemKind', 'quantity', 'unitPrice', 'lineTotal'],
    group: 'Vendite',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation, context }) => {
        if (!req || !doc) return doc
        if (operation !== 'update') return doc
        if ((context as Record<string, unknown> | undefined)?.skipSessionSync) return doc

        const trackedKeys = [
          'appointmentMode',
          'appointmentStatus',
          'appointmentRequestedDate',
          'appointmentRequestedTime',
          'appointmentProposedDate',
          'appointmentProposedTime',
          'appointmentProposalNote',
          'appointmentConfirmedAt',
        ] as const

        const hasRelevantChange = trackedKeys.some((key) => {
          const nextValue = (doc as Record<string, unknown>)[key] ?? null
          const prevValue = (previousDoc as Record<string, unknown> | undefined)?.[key] ?? null
          return JSON.stringify(nextValue) !== JSON.stringify(prevValue)
        })

        if (!hasRelevantChange) return doc

        const sessions = await req.payload.find({
          collection: 'order-service-sessions',
          overrideAccess: true,
          req,
          depth: 0,
          limit: 500,
          where: {
            orderServiceItem: { equals: doc.id },
          },
        })

        for (const session of sessions.docs) {
          await req.payload.update({
            collection: 'order-service-sessions',
            id: session.id,
            overrideAccess: true,
            req,
            data: {
              appointmentMode:
                typeof doc.appointmentMode === 'string' ? doc.appointmentMode : undefined,
              appointmentStatus:
                typeof doc.appointmentStatus === 'string' ? doc.appointmentStatus : undefined,
              appointmentRequestedDate:
                typeof doc.appointmentRequestedDate === 'string'
                  ? doc.appointmentRequestedDate
                  : undefined,
              appointmentRequestedTime:
                typeof doc.appointmentRequestedTime === 'string'
                  ? doc.appointmentRequestedTime
                  : undefined,
              appointmentProposedDate:
                typeof doc.appointmentProposedDate === 'string'
                  ? doc.appointmentProposedDate
                  : undefined,
              appointmentProposedTime:
                typeof doc.appointmentProposedTime === 'string'
                  ? doc.appointmentProposedTime
                  : undefined,
              appointmentProposalNote:
                typeof doc.appointmentProposalNote === 'string'
                  ? doc.appointmentProposalNote
                  : undefined,
              appointmentConfirmedAt:
                typeof doc.appointmentConfirmedAt === 'string'
                  ? doc.appointmentConfirmedAt
                  : undefined,
            },
          })
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'itemKind',
          type: 'select',
          required: true,
          defaultValue: 'service',
          options: [
            { label: 'Service', value: 'service' },
            { label: 'Package', value: 'package' },
          ],
        },
        {
          name: 'variantKey',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'variantLabel',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentMode',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'Nessuno', value: 'none' },
            { label: 'Slot richiesto', value: 'requested_slot' },
            { label: 'Contatto successivo', value: 'contact_later' },
          ],
        },
        {
          name: 'appointmentStatus',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'Nessuno', value: 'none' },
            { label: 'Pending', value: 'pending' },
            { label: 'Confermato', value: 'confirmed' },
            { label: 'Alternativa proposta', value: 'alternative_proposed' },
            { label: 'Confermato da cliente', value: 'confirmed_by_customer' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentRequestedDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'appointmentRequestedTime',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentProposedDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'appointmentProposedTime',
          type: 'text',
        },
      ],
    },
    {
      name: 'appointmentProposalNote',
      type: 'textarea',
    },
    {
      name: 'appointmentConfirmedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'serviceTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'serviceSlug',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'durationMinutes',
          type: 'number',
          min: 0,
        },
        {
          name: 'sessions',
          type: 'number',
          min: 1,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'currency',
          type: 'text',
          required: true,
          defaultValue: 'EUR',
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'lineTotal',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
  ],
  timestamps: true,
}
