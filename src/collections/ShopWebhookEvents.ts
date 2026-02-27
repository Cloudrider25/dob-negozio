import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const ShopWebhookEvents: CollectionConfig = {
  slug: 'shop-webhook-events',
  admin: {
    useAsTitle: 'eventID',
    defaultColumns: ['eventID', 'provider', 'type', 'processed', 'createdAt'],
    group: 'Sistema',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'eventID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
      defaultValue: 'custom',
    },
    {
      name: 'type',
      type: 'text',
      required: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      index: true,
    },
    {
      name: 'processed',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'processedAt',
      type: 'date',
    },
    {
      name: 'payload',
      type: 'json',
    },
    {
      name: 'error',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
