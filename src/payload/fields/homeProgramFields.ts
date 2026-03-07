import type { Field } from 'payload'

export const homeProgramFields: Field[] = [
  {
    name: 'homeProgram',
    type: 'relationship',
    relationTo: 'programs',
    admin: {
      description: 'Seleziona il programma da mostrare in homepage.',
    },
  },
]
