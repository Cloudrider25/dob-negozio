import type { Field } from 'payload'

export const cookiePolicyContentFields: Field[] = [
  {
    name: 'cookiePolicyPageTitle',
    label: 'Page title',
    type: 'text',
    localized: true,
  },
  {
    name: 'cookiePolicyPageIntro',
    label: 'Page intro',
    type: 'textarea',
    localized: true,
  },
  {
    name: 'cookiePolicySections',
    label: 'Page sections',
    type: 'array',
    labels: {
      singular: 'Section',
      plural: 'Sections',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      {
        name: 'body',
        type: 'textarea',
        localized: true,
      },
    ],
  },
]
