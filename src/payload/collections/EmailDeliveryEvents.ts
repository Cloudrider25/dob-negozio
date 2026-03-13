import type { CollectionConfig } from 'payload'

import { EMAIL_CHANNEL_OPTIONS, EMAIL_EVENT_OPTIONS } from '@/lib/server/email/events'
import { isAdmin } from '../access/isAdmin'

export const EmailDeliveryEvents: CollectionConfig = {
  slug: 'email-delivery-events',
  defaultSort: '-createdAt',
  labels: {
    singular: 'Email Delivery Event',
    plural: 'Email Delivery Events',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['eventKey', 'channel', 'to', 'status', 'createdAt'],
    group: 'Sistema',
    components: {
      beforeList: ['/admin/components/EmailDeliveryEventsListTools'],
    },
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
        {
          name: 'eventKey',
          type: 'select',
          required: true,
          index: true,
          options: [...EMAIL_EVENT_OPTIONS],
        },
        {
          name: 'channel',
          type: 'select',
          required: true,
          index: true,
          options: [...EMAIL_CHANNEL_OPTIONS],
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
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'to',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'subject',
          type: 'text',
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'queued',
          index: true,
          options: [
            { label: 'Queued', value: 'queued' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
            { label: 'Skipped', value: 'skipped' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          type: 'text',
        },
        {
          name: 'relatedCollection',
          type: 'text',
        },
        {
          name: 'relatedID',
          type: 'text',
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
    {
      name: 'payloadSnapshot',
      type: 'json',
    },
  ],
  timestamps: true,
}
