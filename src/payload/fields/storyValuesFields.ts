import type { Field } from 'payload'

export const storyValuesFields: Field[] = [
  {
    name: 'storyValues',
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
            name: 'description',
            type: 'textarea',
            localized: true,
          },
          {
            name: 'media',
            type: 'upload',
            relationTo: 'media',
          },
        ],
      },
    ],
  },
]
