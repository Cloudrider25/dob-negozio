import type { CollectionConfig } from 'payload'

import { sendAdminAuthEventNotification } from '@/lib/server/email/businessNotifications'
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
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return doc

        const eventType = typeof doc?.eventType === 'string' ? doc.eventType : ''
        const eventKey =
          eventType === 'login_success'
            ? 'login_success_admin_notice'
            : eventType === 'login_failed'
              ? 'login_failed_admin_notice'
              : eventType === 'forgot_password'
                ? 'password_reset_requested'
                : eventType === 'reset_password'
                  ? 'password_reset_completed'
                  : null

        if (!eventKey) return doc

        await sendAdminAuthEventNotification({
          payload: req.payload,
          req,
          eventKey,
          email: typeof doc?.email === 'string' ? doc.email : '',
          ip: typeof doc?.ip === 'string' ? doc.ip : '',
          userAgent: typeof doc?.userAgent === 'string' ? doc.userAgent : '',
          message: typeof doc?.message === 'string' ? doc.message : '',
        })

        return doc
      },
    ],
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
