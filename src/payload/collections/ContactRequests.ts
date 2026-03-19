import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const ContactRequests: CollectionConfig = {
  slug: 'contact-requests',
  labels: {
    singular: 'Richiesta contatto',
    plural: 'Richieste contatto',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'contactReason', 'status', 'createdAt'],
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
    {
      name: 'contactReason',
      type: 'select',
      required: true,
      options: [
        { label: 'Informazioni generali', value: 'general' },
        { label: 'Prenotazioni', value: 'booking' },
        { label: 'Supporto ordini', value: 'order-support' },
        { label: 'Collaborazioni', value: 'partnership' },
      ],
      index: true,
    },
    { name: 'topic', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'attachmentsViewer',
      type: 'ui',
      label: 'Attachments',
      admin: {
        components: {
          Field: '/admin/components/ContactRequestAttachmentsField',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['new', 'in-progress', 'closed'],
      defaultValue: 'new',
      required: true,
      index: true,
    },
  ],
  timestamps: true,
}
