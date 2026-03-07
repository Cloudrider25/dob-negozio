import type { Field } from 'payload'

export const heroFields: Field[] = [
  {
    name: 'heroTitleMode',
    type: 'select',
    required: true,
    defaultValue: 'fixed',
    options: [
      { label: 'Fisso', value: 'fixed' },
      { label: 'Dinamico', value: 'dynamic' },
    ],
  },
  {
    name: 'heroStyle',
    type: 'select',
    required: true,
    defaultValue: 'style1',
    options: [
      { label: 'Style 1', value: 'style1' },
      { label: 'Style 2', value: 'style2' },
    ],
  },
  {
    name: 'heroTitle',
    type: 'text',
    localized: true,
  },
  {
    name: 'heroDescription',
    type: 'textarea',
    localized: true,
  },
  {
    name: 'heroMedia',
    type: 'upload',
    relationTo: 'media',
    hasMany: true,
    maxRows: 2,
  },
]
