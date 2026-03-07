import type { Field } from 'payload'

export const storyTeamFields: Field[] = [
  {
    name: 'storyTeam',
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
        name: 'items',
        type: 'array',
        minRows: 1,
        fields: [
          {
            name: 'name',
            type: 'text',
            localized: true,
          },
          {
            name: 'role',
            type: 'text',
            localized: true,
          },
          {
            name: 'bio',
            type: 'textarea',
            localized: true,
          },
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
          },
        ],
      },
    ],
  },
]
