import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const ConsultationLeads: CollectionConfig = {
  slug: 'consultation-leads',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'phone', 'status', 'createdAt'],
    group: 'CRM',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'skinType', type: 'text' },
    {
      name: 'concerns',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      options: ['new', 'in-progress', 'closed'],
      defaultValue: 'new',
      required: true,
      index: true,
    },
    { name: 'source', type: 'text', index: true },
    { name: 'locale', type: 'text' },
    { name: 'pagePath', type: 'text' },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
  timestamps: true,
}
