import type { Field } from 'payload'

const hiddenAdmin = {
  hidden: true,
  readOnly: true,
  description: 'Deprecated legacy field. Kept temporarily to avoid data loss before a dedicated migration.',
} as const

export const storyNoteLegacyFields: Field[] = [
  {
    name: 'storyNoteLabel',
    type: 'text',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyNoteBody',
    type: 'textarea',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyNoteCtaLabel',
    type: 'text',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyNoteCtaHref',
    type: 'text',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyNoteMedia',
    type: 'upload',
    relationTo: 'media',
    admin: hiddenAdmin,
  },
]
