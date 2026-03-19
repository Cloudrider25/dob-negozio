import type { Field } from 'payload'

export const faqContentFields: Field[] = [
  {
    name: 'faqGroups',
    type: 'array',
    localized: true,
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'label',
            type: 'text',
            required: true,
          },
          {
            name: 'title',
            type: 'text',
          },
        ],
      },
      {
        name: 'items',
        type: 'array',
        minRows: 1,
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'q',
                type: 'text',
                required: true,
              },
              {
                name: 'a',
                type: 'richText',
                required: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
