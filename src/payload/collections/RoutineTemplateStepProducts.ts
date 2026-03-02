import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const RoutineTemplateStepProducts: CollectionConfig = {
  slug: 'routine-template-step-products',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['routineTemplate', 'routineStep', 'product', 'rank'],
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'rank',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
