import type { Field } from 'payload'

const hiddenAdmin = {
  hidden: true,
  readOnly: true,
  description: 'Deprecated legacy field. Kept temporarily to avoid data loss before a dedicated migration.',
} as const

export const storyHeroHomeLegacyFields: Field[] = [
  {
    name: 'storyHeroHomeTitle',
    type: 'text',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyHeroHomeBody',
    type: 'textarea',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyHeroHomeCtaLabel',
    type: 'text',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyHeroHomeCtaHref',
    type: 'text',
    localized: true,
    admin: hiddenAdmin,
  },
  {
    name: 'storyHeroHomeMedia',
    type: 'upload',
    relationTo: 'media',
    admin: hiddenAdmin,
  },
]
