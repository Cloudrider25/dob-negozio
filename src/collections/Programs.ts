import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'entry',
          type: 'relationship',
          relationTo: [
            'services',
            'treatments',
            'areas',
            'objectives',
            'promotions',
            'products',
            'needs',
            'categories',
            'lines',
            'textures',
          ],
          required: true,
        },
        {
          name: 'itemImage',
          label: 'Immagine aggiuntiva',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'itemTitle',
          label: 'Titolo aggiuntivo',
          type: 'text',
          localized: true,
        },
        {
          name: 'itemDescription',
          label: 'Descrizione aggiuntiva',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
  timestamps: true,
}
