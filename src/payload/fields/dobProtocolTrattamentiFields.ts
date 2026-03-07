import type { Field } from 'payload'

export const dobProtocolTrattamentiFields: Field[] = [
  {
    name: 'dobProtocolTrattamenti',
    type: 'group',
    fields: [
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
]
