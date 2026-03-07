import type { Field } from 'payload'

export const protocolSplitFields: Field[] = [
  {
    name: 'protocolSplit',
    type: 'group',
    fields: [
      {
        name: 'eyebrow',
        type: 'text',
        localized: true,
      },
      {
        name: 'steps',
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
            name: 'subtitle',
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
