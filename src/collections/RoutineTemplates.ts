import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const RoutineTemplates: CollectionConfig = {
  slug: 'routine-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'productArea', 'timing', 'need', 'active', 'sortOrder'],
    group: 'Routine Engine',
    components: {},
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Generale',
          fields: [
            {
              name: 'name',
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              unique: true,
              index: true,
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'productArea',
              type: 'relationship',
              relationTo: 'product-areas',
              required: true,
            },
            {
              name: 'timing',
              type: 'relationship',
              relationTo: 'timing-products',
              required: true,
            },
            {
              name: 'need',
              type: 'relationship',
              relationTo: 'needs',
              required: true,
            },
            {
              name: 'skinType',
              type: 'relationship',
              relationTo: 'skin-types',
            },
            {
              name: 'isMultibrand',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'brand',
              type: 'relationship',
              relationTo: 'brands',
              admin: {
                condition: (_, siblingData) => !siblingData?.isMultibrand,
              },
            },
            {
              name: 'brandLine',
              type: 'relationship',
              relationTo: 'brand-lines',
              admin: {
                condition: (_, siblingData) => !siblingData?.isMultibrand,
              },
            },
            {
              name: 'active',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
            },
          ],
        },
        {
          label: 'Builder',
          fields: [
            {
              name: 'builderUI',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/RoutineTemplateBuilderClient',
                },
              },
            },
          ],
        },
        {
          label: 'Regole',
          fields: [
            {
              name: 'rulesUI',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/RoutineTemplateRulesClient',
                },
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
