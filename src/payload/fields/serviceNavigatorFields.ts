import type { Field } from 'payload'

export const serviceNavigatorFields: Field[] = [
  {
    name: 'serviceNavigator',
    type: 'group',
    fields: [
      {
        name: 'step0Heading',
        type: 'text',
        localized: true,
        admin: {
          description: 'Titolo step 0 del Service Navigator.',
        },
      },
      {
        name: 'step0Description',
        type: 'textarea',
        localized: true,
        admin: {
          description: 'Testo step 0 del Service Navigator.',
        },
      },
      {
        name: 'step0MediaPlaceholder',
        type: 'text',
        localized: true,
        admin: {
          description: 'Testo fallback sopra il media dello step 0.',
        },
      },
      {
        name: 'step0Media',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description: 'Media dello step 0 nel pannello destro.',
        },
      },
    ],
  },
]
