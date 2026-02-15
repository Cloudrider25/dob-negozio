import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const BrandLines: CollectionConfig = {
  slug: 'brand-lines',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'brand', 'active', 'sortOrder'],
    group: 'Catalogo Shop',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
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
      index: true,
      required: true,
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
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
    {
      name: 'lineHeadline',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'usage',
      label: "Modo d'uso",
      type: 'textarea',
      localized: true,
    },
    {
      name: 'activeIngredients',
      label: 'Principi attivi',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'results',
      label: 'Risultati',
      type: 'textarea',
      localized: true,
    },
  ],
  timestamps: true,
}
