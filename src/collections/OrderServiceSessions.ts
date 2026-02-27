import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const OrderServiceSessions: CollectionConfig = {
  slug: 'order-service-sessions',
  labels: {
    singular: 'Appuntamento',
    plural: 'Appuntamenti',
  },
  admin: {
    useAsTitle: 'sessionLabel',
    defaultColumns: [
      'order',
      'serviceTitle',
      'sessionIndex',
      'sessionLabel',
      'appointmentStatus',
      'appointmentRequestedDate',
    ],
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
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'orderServiceItem',
      type: 'relationship',
      relationTo: 'order-service-items',
      required: true,
      index: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'itemKind',
          type: 'select',
          required: true,
          defaultValue: 'service',
          options: [
            { label: 'Service', value: 'service' },
            { label: 'Package', value: 'package' },
          ],
        },
        {
          name: 'variantKey',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'variantLabel',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sessionIndex',
          type: 'number',
          required: true,
          min: 1,
          admin: { readOnly: true },
        },
        {
          name: 'sessionLabel',
          type: 'text',
          required: true,
        },
        {
          name: 'sessionsTotal',
          type: 'number',
          min: 1,
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentMode',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'Nessuno', value: 'none' },
            { label: 'Slot richiesto', value: 'requested_slot' },
            { label: 'Contatto successivo', value: 'contact_later' },
          ],
        },
        {
          name: 'appointmentStatus',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'Nessuno', value: 'none' },
            { label: 'Pending', value: 'pending' },
            { label: 'Confermato', value: 'confirmed' },
            { label: 'Alternativa proposta', value: 'alternative_proposed' },
            { label: 'Confermato da cliente', value: 'confirmed_by_customer' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentRequestedDate',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'appointmentRequestedTime',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'appointmentProposedDate',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'appointmentProposedTime',
          type: 'text',
        },
      ],
    },
    {
      name: 'appointmentProposalNote',
      type: 'textarea',
    },
    {
      name: 'appointmentConfirmedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'serviceTitle', type: 'text', required: true },
        { name: 'serviceSlug', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'durationMinutes', type: 'number', min: 0 },
        { name: 'currency', type: 'text', required: true, defaultValue: 'EUR' },
        { name: 'sessionPrice', type: 'number', required: true, min: 0 },
      ],
    },
  ],
  timestamps: true,
}
