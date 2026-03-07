import type { Field } from 'payload'

export const valuesSectionFields: Field[] = [
  {
    name: 'valuesSection',
    type: 'group',
    fields: [
      {
        name: 'items',
        type: 'array',
        minRows: 1,
        fields: [
          {
            name: 'label',
            type: 'text',
            localized: true,
          },
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'ctaLabel',
            type: 'text',
            localized: true,
          },
          {
            name: 'ctaHref',
            type: 'text',
            localized: true,
          },
        ],
      },
      {
        name: 'media',
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
]
