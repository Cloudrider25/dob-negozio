import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const AuthAuditEvents: CollectionConfig = {
  slug: 'auth-audit-events',
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: ['eventType', 'success', 'email', 'ip', 'createdAt'],
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
      name: 'eventType',
      type: 'select',
      required: true,
      options: ['login_success', 'login_failed', 'forgot_password', 'reset_password'],
      index: true,
    },
    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      index: true,
    },
    {
      name: 'email',
      type: 'email',
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'ip',
      type: 'text',
      index: true,
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'message',
      type: 'text',
    },
    {
      name: 'meta',
      type: 'json',
    },
  ],
  timestamps: true,
}
