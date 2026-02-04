import type { CollectionConfig, Validate } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Boosts: CollectionConfig = {
  slug: 'boosts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['score', 'objective', 'skinType', 'timing', 'routineStep', 'product'],
    group: 'Shop',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'score',
      type: 'number',
      required: true,
      defaultValue: 0,
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
      name: 'timing',
      type: 'relationship',
      relationTo: 'timing-products',
    },
    {
      name: 'routineStep',
      type: 'relationship',
      relationTo: 'routine-steps',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
    },
    {
      name: 'brandLine',
      type: 'relationship',
      relationTo: 'brand-lines',
    },
    {
      name: 'attribute',
      type: 'relationship',
      relationTo: 'attributes',
    },
    {
      name: 'attributeValueId',
      type: 'number',
      validate: (async (value, { data, siblingData, req }) => {
        if (value === null || value === undefined) return true
        const attributeRef = siblingData?.attribute ?? data?.attribute
        const attributeId =
          typeof attributeRef === 'object' && attributeRef
            ? (attributeRef as { id?: number | string }).id
            : attributeRef
        if (!attributeId) return 'Seleziona prima Attribute.'
        if (!req?.payload) return true
        const attribute = await req.payload.findByID({
          collection: 'attributes',
          id: attributeId as number | string,
          depth: 0,
          overrideAccess: false,
          req,
        })
        if (!attribute || attribute.type !== 'enum') {
          return 'Attribute non supporta valori enum.'
        }
        const valueId = Number(value)
        if (!Number.isFinite(valueId)) return 'Attribute value non valido.'
        const values = Array.isArray(attribute.values)
          ? (attribute.values as Array<{ id?: number | string }>)
          : []
        const matches = values.some((item) => {
          const itemId = typeof item.id === 'string' ? Number(item.id) : item.id
          return itemId === valueId
        })
        return matches ? true : 'Attribute value non valido per questo attribute.'
      }) satisfies Validate<number>,
    },
  ],
  timestamps: true,
}
