import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Zones: CollectionConfig = {
  slug: 'zones',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['code', 'label'],
    group: 'Servizi',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
      required: true,
    },
  ],
  timestamps: true,
}
