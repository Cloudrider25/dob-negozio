import type { Field } from 'payload'

export const contactContentFields: Field[] = [
  {
    name: 'contactTitle',
    type: 'text',
    localized: true,
  },
  {
    name: 'contactDescription',
    type: 'richText',
    localized: true,
  },
]
