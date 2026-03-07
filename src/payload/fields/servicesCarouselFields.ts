import type { Field } from 'payload'

export const servicesCarouselFields: Field[] = [
  {
    name: 'servicesCarousel',
    type: 'group',
    label: 'Service Carousel',
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
          {
            name: 'serviceTypes',
            type: 'select',
            hasMany: true,
            options: [
              { label: 'Singolo', value: 'single' },
              { label: 'Pacchetto', value: 'package' },
            ],
            admin: {
              width: '75%',
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'gender',
            type: 'select',
            hasMany: true,
            options: [
              { label: 'Unisex', value: 'unisex' },
              { label: 'Donna', value: 'female' },
              { label: 'Uomo', value: 'male' },
            ],
            admin: {
              width: '50%',
            },
          },
          {
            name: 'modality',
            type: 'select',
            hasMany: true,
            options: [
              { label: 'Device', value: 'device' },
              { label: 'Manual', value: 'manual' },
              { label: 'Laser', value: 'laser' },
              { label: 'Consultation', value: 'consultation' },
              { label: 'Wax', value: 'wax' },
            ],
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
            name: 'treatments',
            type: 'relationship',
            relationTo: 'treatments',
            hasMany: true,
            admin: {
              width: '100%',
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'objective',
            type: 'relationship',
            relationTo: 'objectives',
            hasMany: true,
            admin: {
              width: '50%',
            },
          },
          {
            name: 'area',
            type: 'relationship',
            relationTo: 'areas',
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
            name: 'intent',
            type: 'relationship',
            relationTo: 'intents',
            hasMany: true,
            admin: {
              width: '50%',
            },
          },
          {
            name: 'zone',
            type: 'relationship',
            relationTo: 'zones',
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
