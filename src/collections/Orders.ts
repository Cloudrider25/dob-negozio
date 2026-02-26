import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { sendSMTPEmail } from '@/lib/email/sendSMTPEmail'

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
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'paymentStatus', 'customerEmail', 'total', 'createdAt'],
    group: 'Vendite',
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
        if (nextStatus !== 'alternative_proposed' && nextStatus !== 'confirmed') return doc

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

        const formatDate = (value: string) => {
          if (!value) return ''
          const d = new Date(value)
          if (Number.isNaN(d.getTime())) return value
          return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(d)
        }

        const slotText =
          nextStatus === 'alternative_proposed'
            ? [formatDate(proposedDate), proposedTime].filter(Boolean).join(' · ') || 'Da definire'
            : [formatDate(proposedDate || requestedDate), proposedTime || requestedTime]
                .filter(Boolean)
                .join(' · ') || 'Da definire'

        const subject =
          nextStatus === 'alternative_proposed'
            ? `Proposta nuovo appuntamento per ordine ${orderNumber}`
            : `Appuntamento confermato per ordine ${orderNumber}`

        const text =
          nextStatus === 'alternative_proposed'
            ? [
                `Ciao ${customerName},`,
                '',
                `ti proponiamo un'alternativa per il tuo appuntamento relativo all'ordine ${orderNumber}.`,
                `Slot proposto: ${slotText}`,
                note ? `Nota: ${note}` : '',
                '',
                'Ti contatteremo per conferma.',
                'DOB Milano',
              ]
                .filter(Boolean)
                .join('\n')
            : [
                `Ciao ${customerName},`,
                '',
                `il tuo appuntamento per l'ordine ${orderNumber} è stato confermato.`,
                `Slot: ${slotText}`,
                note ? `Nota: ${note}` : '',
                '',
                'A presto,',
                'DOB Milano',
              ]
                .filter(Boolean)
                .join('\n')

        const html = `
          <p>Ciao ${customerName},</p>
          <p>${
            nextStatus === 'alternative_proposed'
              ? `ti proponiamo un'alternativa per il tuo appuntamento relativo all'ordine <strong>${orderNumber}</strong>.`
              : `il tuo appuntamento per l'ordine <strong>${orderNumber}</strong> è stato confermato.`
          }</p>
          <p><strong>Slot:</strong> ${slotText}</p>
          ${note ? `<p><strong>Nota:</strong> ${note}</p>` : ''}
          <p>${nextStatus === 'alternative_proposed' ? 'Ti contatteremo per conferma.' : 'A presto,'}<br/>DOB Milano</p>
        `

        const adminEmail =
          process.env.SHOP_APPOINTMENT_ADMIN_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || ''

        try {
          if (customerEmail && customerEmail.includes('@')) {
            await sendSMTPEmail({
              payload: req.payload,
              to: customerEmail,
              subject,
              text,
              html,
            })
          }
          if (adminEmail && adminEmail.includes('@')) {
            await sendSMTPEmail({
              payload: req.payload,
              to: adminEmail,
              subject: `[Admin] ${subject}`,
              text: `Customer: ${customerEmail || 'n/a'}\n${text}`,
              html: `<p><strong>Customer:</strong> ${customerEmail || 'n/a'}</p>${html}`,
            })
          }
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
                  name: 'total',
                  type: 'number',
                  min: 0,
                  required: true,
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
              type: 'row',
              fields: [
                {
                  name: 'appointmentRequestedDate',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                    },
                    readOnly: true,
                  },
                },
                {
                  name: 'appointmentRequestedTime',
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
              admin: {
                description: 'Messaggio/nota per proporre alternativa o conferma interna.',
              },
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
          ],
        },
        {
          label: 'Service Items',
          fields: [
            {
              name: 'orderServiceItemsPanel',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/OrderServiceItemsList',
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
