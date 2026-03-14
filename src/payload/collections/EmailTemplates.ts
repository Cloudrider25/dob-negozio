import type { CollectionConfig } from 'payload'

import {
  EMAIL_CHANNEL_OPTIONS,
  EMAIL_EVENT_OPTIONS,
  EMAIL_TEMPLATE_TYPE_OPTIONS,
  type EmailEventKey,
  getEmailEventMeta,
} from '@/lib/server/email/events'
import { isAdmin } from '../access/isAdmin'

const buildTemplateKey = (data: Record<string, unknown>) => {
  const eventKey = typeof data.eventKey === 'string' ? data.eventKey.trim() : ''
  const locale = typeof data.locale === 'string' ? data.locale.trim() : ''
  const channel = typeof data.channel === 'string' ? data.channel.trim() : ''
  return [eventKey, locale, channel].filter(Boolean).join(':')
}

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  labels: {
    singular: 'Email Template',
    plural: 'Email Templates',
  },
  admin: {
    useAsTitle: 'templateKey',
    defaultColumns: ['eventKey', 'templateType', 'locale', 'channel', 'active', 'updatedAt'],
    group: 'Impostazioni',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        const nextData = data as Record<string, unknown>
        const templateKey = buildTemplateKey(nextData)
        if (templateKey) {
          nextData.templateKey = templateKey
        }

        const eventKey =
          typeof nextData.eventKey === 'string' &&
          EMAIL_EVENT_OPTIONS.some((option) => option.value === nextData.eventKey)
            ? (nextData.eventKey as EmailEventKey)
            : null
        if (eventKey) {
          const meta = getEmailEventMeta(eventKey)
          nextData.templateType = meta.type
          nextData.availableVariables = meta.availableVariables
          nextData.testDataExample = meta.testDataExample
          if (typeof nextData.description !== 'string' || !nextData.description.trim()) {
            nextData.description = meta.description
          }
        }

        return nextData
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (!doc || typeof doc !== 'object') return doc

        const nextDoc = doc as Record<string, unknown>
        if (
          typeof nextDoc.eventKey === 'string' &&
          EMAIL_EVENT_OPTIONS.some((option) => option.value === nextDoc.eventKey)
        ) {
          nextDoc.templateType = getEmailEventMeta(nextDoc.eventKey as EmailEventKey).type
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'templateKey',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eventKey',
          type: 'select',
          required: true,
          index: true,
          options: [...EMAIL_EVENT_OPTIONS],
        },
        {
          name: 'locale',
          type: 'select',
          required: true,
          defaultValue: 'it',
          index: true,
          options: [
            { label: 'Italiano', value: 'it' },
            { label: 'English', value: 'en' },
            { label: 'Russian', value: 'ru' },
          ],
        },
        {
          name: 'channel',
          type: 'select',
          required: true,
          index: true,
          options: [...EMAIL_CHANNEL_OPTIONS],
        },
        {
          name: 'templateType',
          label: 'Type',
          type: 'select',
          index: true,
          options: [...EMAIL_TEMPLATE_TYPE_OPTIONS],
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
          index: true,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'availableVariablesUI',
      type: 'ui',
      label: 'Available Variables',
      admin: {
        components: {
          Field: '/admin/components/EmailTemplateVariablesField',
        },
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'html',
      type: 'textarea',
      required: true,
      admin: {
        rows: 14,
      },
    },
    {
      name: 'text',
      type: 'textarea',
      admin: {
        rows: 10,
      },
    },
    {
      name: 'availableVariables',
      type: 'json',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'htmlPreview',
      type: 'ui',
      label: 'HTML Preview',
      admin: {
        components: {
          Field: '/admin/components/EmailTemplatePreviewField',
        },
      },
    },
    {
      name: 'testDataExample',
      type: 'json',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
  timestamps: true,
}
