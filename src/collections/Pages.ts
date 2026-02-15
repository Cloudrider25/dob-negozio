import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Contenuti',
    useAsTitle: 'pageKey',
    defaultColumns: ['pageKey', 'heroTitleMode'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'pageKey',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Services', value: 'services' },
        { label: 'Shop', value: 'shop' },
        { label: 'Journal', value: 'journal' },
        { label: 'Location', value: 'location' },
        { label: 'Our Story', value: 'our-story' },
        { label: 'DOB Protocol', value: 'dob-protocol' },
        { label: 'Contact', value: 'contact' },
        { label: 'Checkout', value: 'checkout' },
      ],
      admin: {
        description: 'Configura solo le pagine esistenti (no categorie).',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sezione 1',
          admin: {
            condition: (data) =>
              data?.pageKey === 'home' || data?.pageKey === 'our-story' || data?.pageKey === 'shop',
          },
          fields: [
            {
              name: 'heroTitleMode',
              type: 'select',
              required: true,
              defaultValue: 'fixed',
              options: [
                { label: 'Fisso', value: 'fixed' },
                { label: 'Dinamico', value: 'dynamic' },
              ],
            },
            {
              name: 'heroStyle',
              type: 'select',
              required: true,
              defaultValue: 'style1',
              options: [
                { label: 'Style 1', value: 'style1' },
                { label: 'Style 2', value: 'style2' },
              ],
            },
            {
              name: 'heroTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 2,
            },
          ],
        },
        {
          label: 'Routine Builder',
          admin: {
            condition: (data) => data?.pageKey === 'shop',
          },
          fields: [
            {
              name: 'routineBuilderStep1Title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Titolo Step 1.',
              },
            },
            {
              name: 'routineBuilderStep2Title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Titolo Step 2.',
              },
            },
          ],
        },
        {
          label: 'Sezione 2',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [
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
          ],
        },
        {
          label: 'Checkout',
          admin: {
            condition: (data) => data?.pageKey === 'checkout',
          },
          fields: [
            {
              name: 'checkoutNotice',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Sezione 3',
          admin: {
            condition: (data) => data?.pageKey === 'home' || data?.pageKey === 'dob-protocol',
          },
          fields: [
            {
              name: 'protocolSplit',
              type: 'group',
              fields: [
                {
                  name: 'eyebrow',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'steps',
                  type: 'array',
                  minRows: 1,
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sezione 4',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [
            {
              name: 'storyHeroHomeTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'storyHeroHomeBody',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'storyHeroHomeCtaLabel',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'storyHeroHomeCtaHref',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'storyHeroHomeMedia',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Sezione 2',
          admin: {
            condition: (data) => data?.pageKey === 'our-story',
          },
          fields: [
            {
              name: 'storyHeroTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'storyHeroBody',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'storyHeroCtaLabel',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'storyHeroCtaHref',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'storyHeroMedia',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Sezione 3',
          admin: {
            condition: (data) => data?.pageKey === 'our-story',
          },
          fields: [
            {
              name: 'storyNoteLabel',
              type: 'text',
              localized: true,
            },
            {
              name: 'storyNoteBody',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'storyNoteCtaLabel',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'storyNoteCtaHref',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'storyNoteMedia',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Sezione 5',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [
            {
              name: 'homeProgram',
              type: 'relationship',
              relationTo: 'programs',
              admin: {
                description: 'Seleziona il programma da mostrare in homepage.',
              },
            },
          ],
        },
        {
          label: 'Sezione 6',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [
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
          ],
        },
        {
          label: 'Sezione 7',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [
            {
              name: 'valuesSection',
              type: 'group',
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  minRows: 1,
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'ctaHref',
                      type: 'text',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Sezione 4',
          admin: {
            condition: (data) => data?.pageKey === 'our-story',
          },
          fields: [
            {
              name: 'storyValues',
              type: 'group',
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  minRows: 1,
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sezione 5',
          admin: {
            condition: (data) => data?.pageKey === 'our-story',
          },
          fields: [
            {
              name: 'storyTeam',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'items',
                  type: 'array',
                  minRows: 1,
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'role',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'bio',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
