import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const RoutineStepRules: CollectionConfig = {
  slug: 'routine-step-rules',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['routineStep', 'ruleType', 'timing', 'objective', 'skinType'],
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
      name: 'routineStep',
      type: 'relationship',
      relationTo: 'routine-steps',
      required: true,
    },
    {
      name: 'timing',
      type: 'relationship',
      relationTo: 'timing-products',
    },
    {
      name: 'objective',
      type: 'relationship',
      relationTo: 'objectives',
    },
    {
      name: 'skinType',
      type: 'relationship',
      relationTo: 'skin-types',
    },
    {
      name: 'ruleType',
      type: 'select',
      required: true,
      defaultValue: 'require',
      options: [
        { label: 'Require', value: 'require' },
        { label: 'Forbid', value: 'forbid' },
        { label: 'Warn', value: 'warn' },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
