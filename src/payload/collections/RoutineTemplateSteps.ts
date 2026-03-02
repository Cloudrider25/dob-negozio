import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const RoutineTemplateSteps: CollectionConfig = {
  slug: 'routine-template-steps',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['routineTemplate', 'routineStep', 'stepOrder', 'required'],
    group: 'Routine Engine',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'routineTemplate',
      type: 'relationship',
      relationTo: 'routine-templates',
      required: true,
    },
    {
      name: 'routineStep',
      type: 'relationship',
      relationTo: 'routine-steps',
      required: true,
    },
    {
      name: 'stepOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'required',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
