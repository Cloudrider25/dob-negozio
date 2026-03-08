import type { Access, CollectionConfig } from 'payload'

import { sendAppointmentStatusNotifications } from '@/lib/server/email/businessNotifications'
import { isAdmin } from '../access/isAdmin'

const createOrderNumber = () => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `DOB-${y}${m}${d}-${random}`
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Ordine',
    plural: 'Ordini',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'paymentStatus', 'customerEmail', 'total', 'createdAt'],
    group: 'CRM',
  },
  access: {
    read: (({ req }) => {
      if (isAdmin({ req })) return true
      if (!req.user) return false
      return {
        customer: {
          equals: req.user.id,
        },
      }
    }) satisfies Access,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data
        if (operation !== 'create') return data
        if (!data.orderNumber) {
          data.orderNumber = createOrderNumber()
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data

        const nextStatus =
          typeof data.appointmentStatus === 'string'
            ? data.appointmentStatus
            : typeof originalDoc?.appointmentStatus === 'string'
              ? originalDoc.appointmentStatus
              : 'none'

        const isConfirmed =
          nextStatus === 'confirmed' || nextStatus === 'confirmed_by_customer'

        const currentConfirmedAt =
          typeof data.appointmentConfirmedAt === 'string'
            ? data.appointmentConfirmedAt
            : typeof originalDoc?.appointmentConfirmedAt === 'string'
              ? originalDoc.appointmentConfirmedAt
              : ''

        if (isConfirmed && !currentConfirmedAt) {
          data.appointmentConfirmedAt = new Date().toISOString()
        }

        const nextOrderStatus =
          typeof data.status === 'string'
            ? data.status
            : typeof originalDoc?.status === 'string'
              ? originalDoc.status
              : ''
        const nextPaymentStatus =
          typeof data.paymentStatus === 'string'
            ? data.paymentStatus
            : typeof originalDoc?.paymentStatus === 'string'
              ? originalDoc.paymentStatus
              : ''
        const hasCommission =
          typeof data.commissionAmount === 'number'
            ? data.commissionAmount > 0
            : typeof originalDoc?.commissionAmount === 'number'
              ? originalDoc.commissionAmount > 0
              : false

        if (
          hasCommission &&
          (nextOrderStatus === 'cancelled' ||
            nextOrderStatus === 'refunded' ||
            nextPaymentStatus === 'refunded')
        ) {
          data.commissionStatus = 'void'
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (!doc || !req) return doc
        if (operation !== 'update') return doc

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

        const cartMode = typeof doc.cartMode === 'string' ? doc.cartMode : ''
        if (cartMode !== 'services_only' && cartMode !== 'mixed') return doc

        const serviceItems = await req.payload.find({
          collection: 'order-service-items',
          overrideAccess: true,
          req,
          depth: 0,
          limit: 500,
          where: {
            order: { equals: doc.id },
          },
        })

        if (!serviceItems.docs.length) return doc

        for (const item of serviceItems.docs) {
          await req.payload.update({
            collection: 'order-service-items',
            id: item.id,
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

        const serviceSessions = await req.payload.find({
          collection: 'order-service-sessions',
          overrideAccess: true,
          req,
          depth: 0,
          limit: 1000,
          where: {
            order: { equals: doc.id },
          },
        })

        for (const session of serviceSessions.docs) {
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
      async ({ doc, previousDoc, req, operation }) => {
        if (!doc || !req) return doc
        if (operation !== 'update') return doc

        const nextStatus =
          typeof doc.appointmentStatus === 'string' ? doc.appointmentStatus : 'none'
        const prevStatus =
          typeof previousDoc?.appointmentStatus === 'string' ? previousDoc.appointmentStatus : 'none'

        if (nextStatus === prevStatus) return doc
        if (
          nextStatus !== 'alternative_proposed' &&
          nextStatus !== 'confirmed' &&
          nextStatus !== 'confirmed_by_customer'
        ) {
          return doc
        }

        const customerEmail = typeof doc.customerEmail === 'string' ? doc.customerEmail.trim() : ''
        const customerName = [doc.customerFirstName, doc.customerLastName]
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .join(' ')
          .trim() || 'Cliente'
        const orderNumber = typeof doc.orderNumber === 'string' ? doc.orderNumber : `#${String(doc.id)}`
        const proposedDate = typeof doc.appointmentProposedDate === 'string' ? doc.appointmentProposedDate : ''
        const proposedTime = typeof doc.appointmentProposedTime === 'string' ? doc.appointmentProposedTime : ''
        const requestedDate = typeof doc.appointmentRequestedDate === 'string' ? doc.appointmentRequestedDate : ''
        const requestedTime = typeof doc.appointmentRequestedTime === 'string' ? doc.appointmentRequestedTime : ''
        const note = typeof doc.appointmentProposalNote === 'string' ? doc.appointmentProposalNote : ''

        try {
          await sendAppointmentStatusNotifications({
            payload: req.payload,
            nextStatus,
            customerEmail,
            customerName,
            orderNumber,
            proposedDate,
            proposedTime,
            requestedDate,
            requestedTime,
            note,
          })
        } catch (emailError) {
          req.payload.logger.error({
            err: emailError,
            msg: `Appointment email notification failed for order ${orderNumber}`,
          })
        }

        return doc
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
              name: 'orderNumber',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                readOnly: true,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'pending',
                  options: ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'fulfilled'],
                },
                {
                  name: 'paymentStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'pending',
                  options: ['pending', 'paid', 'failed', 'refunded'],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'inventoryCommitted',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'allocationReleased',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentProvider',
                  type: 'text',
                  required: true,
                  defaultValue: 'manual',
                },
                {
                  name: 'paymentReference',
                  type: 'text',
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
                  name: 'locale',
                  type: 'text',
                  required: true,
                  defaultValue: 'it',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'subtotal',
                  type: 'number',
                  min: 0,
                  required: true,
                },
                {
                  name: 'shippingAmount',
                  type: 'number',
                  min: 0,
                  required: true,
                  defaultValue: 0,
                },
                {
                  name: 'discountAmount',
                  type: 'number',
                  min: 0,
                  required: true,
                  defaultValue: 0,
                },
                {
                  name: 'commissionAmount',
                  type: 'number',
                  min: 0,
                  defaultValue: 0,
                },
                {
                  name: 'total',
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
                  name: 'promoCode',
                  type: 'relationship',
                  relationTo: 'promo-codes',
                },
                {
                  name: 'partner',
                  type: 'relationship',
                  relationTo: 'users',
                  filterOptions: {
                    roles: {
                      contains: 'partner',
                    },
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'promoCodeValue',
                  type: 'text',
                },
                {
                  name: 'commissionStatus',
                  type: 'select',
                  options: ['pending', 'approved', 'paid', 'void'],
                },
              ],
            },
            {
              name: 'promoCodeSnapshot',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'code',
                      type: 'text',
                    },
                    {
                      name: 'partnerName',
                      type: 'text',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'discountType',
                      type: 'text',
                    },
                    {
                      name: 'discountValue',
                      type: 'number',
                      min: 0,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'commissionType',
                      type: 'text',
                    },
                    {
                      name: 'commissionValue',
                      type: 'number',
                      min: 0,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'appliesToProducts',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'appliesToServices',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                  ],
                },
              ],
            },
            {
              name: 'customerEmail',
              type: 'email',
              required: true,
              index: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'customerFirstName',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'customerLastName',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'customerPhone',
              type: 'text',
            },
          ],
        },
        {
          label: 'Shipping Address',
          admin: {
            condition: (data) => {
              if (!data?.cartMode) return true
              return data.cartMode === 'products_only' || data.cartMode === 'mixed'
            },
          },
          fields: [
            {
              name: 'shippingAddress',
              type: 'group',
              fields: [
                {
                  name: 'address',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'postalCode',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'province',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'country',
                  type: 'text',
                  required: true,
                  defaultValue: 'Italy',
                },
              ],
            },
          ],
        },
        {
          label: 'Sendcloud',
          admin: {
            condition: (data) => {
              if (!data?.cartMode) return true
              return data.cartMode === 'products_only' || data.cartMode === 'mixed'
            },
          },
          fields: [
            {
              name: 'sendcloud',
              type: 'group',
              admin: {
                description: 'Dati sincronizzazione spedizione Sendcloud.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'parcelId',
                      type: 'number',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'carrierCode',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'trackingNumber',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'trackingUrl',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                  ],
                },
                {
                  name: 'labelUrl',
                  type: 'text',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'statusMessage',
                  type: 'text',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'lastSyncAt',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    readOnly: true,
                  },
                },
                {
                  name: 'error',
                  type: 'textarea',
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Appointment / Fulfillment',
          admin: {
            condition: (data) => {
              if (!data?.cartMode) return true
              return data.cartMode === 'services_only' || data.cartMode === 'mixed'
            },
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'cartMode',
                  type: 'select',
                  defaultValue: 'products_only',
                  options: [
                    { label: 'Solo prodotti', value: 'products_only' },
                    { label: 'Solo servizi', value: 'services_only' },
                    { label: 'Misto', value: 'mixed' },
                  ],
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'productFulfillmentMode',
                  type: 'select',
                  defaultValue: 'shipping',
                  options: [
                    { label: 'Spedizione', value: 'shipping' },
                    { label: 'Ritiro in negozio', value: 'pickup' },
                    { label: 'Nessuno (solo servizi)', value: 'none' },
                  ],
                  admin: {
                    readOnly: true,
                  },
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
                  admin: {
                    readOnly: true,
                  },
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
              name: 'appointmentRequestedDate',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
                readOnly: true,
                condition: () => false,
              },
            },
            {
              name: 'appointmentRequestedTime',
              type: 'text',
              admin: {
                readOnly: true,
                condition: () => false,
              },
            },
            {
              name: 'appointmentProposedDate',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
                condition: () => false,
              },
            },
            {
              name: 'appointmentProposedTime',
              type: 'text',
              admin: {
                condition: () => false,
              },
            },
            {
              name: 'appointmentProposalNote',
              type: 'textarea',
              admin: {
                description:
                  'Nota riepilogativa a livello ordine (i dettagli operativi per seduta sono in Appuntamenti).',
              },
            },
            {
              name: 'appointmentConfirmedAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                condition: () => false,
              },
            },
          ],
        },
        {
          label: 'Product Items',
          admin: {
            condition: (data) => {
              if (!data?.cartMode) return true
              return data.cartMode === 'products_only' || data.cartMode === 'mixed'
            },
          },
          fields: [
            {
              name: 'orderProductItemsPanel',
              type: 'ui',
              admin: {
                components: {
                  Field: '/admin/components/OrderProductItemsList',
                },
              },
            },
          ],
        },
        {
          label: 'Service Items',
          admin: {
            condition: (data) => {
              if (!data?.cartMode) return true
              return data.cartMode === 'services_only' || data.cartMode === 'mixed'
            },
          },
          fields: [
            {
              name: 'orderServiceItemsPanel',
              type: 'ui',
              admin: {
                components: {
                  Field: '/admin/components/OrderServiceItemsList',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
