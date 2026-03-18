import type { Field } from 'payload'

export const faqHeroFields: Field[] = [
  {
    name: 'faqTitle',
    type: 'text',
    localized: true,
  },
  {
    name: 'faqSubtitle',
    type: 'textarea',
    localized: true,
  },
  {
    name: 'faqMedia',
    type: 'upload',
    relationTo: 'media',
  },
]
