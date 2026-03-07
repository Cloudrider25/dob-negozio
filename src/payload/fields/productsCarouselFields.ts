import type { Field } from 'payload'

export const productsCarouselFields: Field[] = [
  {
    name: 'productsCarousel',
    type: 'group',
    label: 'Product Carousel',
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'limit',
            type: 'number',
            min: 1,
            defaultValue: 6,
            admin: {
              width: '25%',
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'needs',
            type: 'relationship',
            relationTo: 'needs',
            hasMany: true,
            admin: {
              width: '50%',
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'textures',
            type: 'relationship',
            relationTo: 'textures',
            hasMany: true,
            admin: {
              width: '50%',
            },
          },
        ],
      },
    ],
  },
]
