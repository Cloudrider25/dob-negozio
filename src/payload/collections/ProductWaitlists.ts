import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const isAdminOrOwnWaitlist: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  if (!req.user) return false

  return {
    customer: {
      equals: req.user.id,
    },
  }
}

export const ProductWaitlists: CollectionConfig = {
  slug: 'product-waitlists',
  labels: {
    singular: 'Product Waitlist',
    plural: 'Product Waitlists',
  },
  admin: {
    useAsTitle: 'productTitle',
    defaultColumns: ['productTitle', 'customerEmail', 'status', 'locale', 'updatedAt'],
    group: 'Sistema',
  },
  access: {
    read: isAdminOrOwnWaitlist,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          index: true,
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'locale',
          type: 'select',
          required: true,
          options: ['it', 'en', 'ru'],
          defaultValue: 'it',
          index: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'active',
          options: ['active', 'notified', 'cancelled'],
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerEmail',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'customerFirstName',
          type: 'text',
        },
        {
          name: 'customerLastName',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'productTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'productSlug',
          type: 'text',
          required: true,
        },
        {
          name: 'productBrand',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'notifiedAt',
          type: 'date',
        },
        {
          name: 'lastAvailabilityAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'notificationError',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
