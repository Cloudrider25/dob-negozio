import type { Field } from 'payload'

export const routineBuilderFields: Field[] = [
  {
    name: 'routineBuilderStep1Title',
    type: 'text',
    localized: true,
    admin: {
      description: 'Titolo Step 1.',
    },
  },
  {
    name: 'routineBuilderStep1Description',
    type: 'textarea',
    localized: true,
    admin: {
      description: 'Descrizione Step 1.',
    },
  },
  {
    name: 'routineBuilderStep2Title',
    type: 'text',
    localized: true,
    admin: {
      description: 'Titolo Step 2.',
    },
  },
  {
    name: 'routineBuilderStep2Description',
    type: 'textarea',
    localized: true,
    admin: {
      description: 'Descrizione Step 2.',
    },
  },
]
