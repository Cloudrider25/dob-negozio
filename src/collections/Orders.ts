import type { Access, CollectionConfig } from 'payload'

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
