import type { Field } from 'payload'

export const storyHeroFields: Field[] = [
  {
    name: 'storyHeroTitle',
    type: 'text',
    localized: true,
  },
  {
    name: 'storyHeroBody',
    type: 'textarea',
    localized: true,
  },
  {
    type: 'row',
    fields: [
      {
        name: 'storyHeroCtaLabel',
        type: 'text',
        localized: true,
        admin: {
          width: '50%',
        },
      },
      {
        name: 'storyHeroCtaHref',
        type: 'text',
        localized: true,
        admin: {
          width: '50%',
        },
      },
    ],
  },
  {
    name: 'storyHeroMedia',
    type: 'upload',
    relationTo: 'media',
  },
]
