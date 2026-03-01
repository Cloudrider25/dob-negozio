import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

const isAdminOrProfileOwner: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  if (!req.user) return false
  return {
    user: {
      equals: req.user.id,
    },
  }
}

export const AccountAestheticProfiles: CollectionConfig = {
  slug: 'account-aesthetic-profiles',
  admin: {
    hidden: true,
    useAsTitle: 'user',
  },
  access: {
    read: isAdminOrProfileOwner,
    update: isAdminOrProfileOwner,
    delete: isAdmin,
    create: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'lastAssessmentDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    { name: 'skinType', type: 'text' },
    { name: 'skinSensitivity', type: 'text' },
    { name: 'fitzpatrick', type: 'text' },
    { name: 'hydrationLevel', type: 'number' },
    { name: 'sebumLevel', type: 'number' },
    { name: 'elasticityLevel', type: 'number' },
    { name: 'acneTendency', type: 'checkbox', defaultValue: false },
    { name: 'rosaceaTendency', type: 'checkbox', defaultValue: false },
    { name: 'hyperpigmentationTendency', type: 'checkbox', defaultValue: false },
    { name: 'allergies', type: 'textarea' },
    { name: 'contraindications', type: 'textarea' },
    { name: 'medications', type: 'textarea' },
    { name: 'pregnancyOrBreastfeeding', type: 'textarea' },
    { name: 'homeCareRoutine', type: 'textarea' },
    { name: 'treatmentGoals', type: 'textarea' },
    { name: 'estheticianNotes', type: 'textarea' },
    { name: 'serviceRecommendations', type: 'textarea' },
    { name: 'productRecommendations', type: 'textarea' },
  ],
  timestamps: true,
}

