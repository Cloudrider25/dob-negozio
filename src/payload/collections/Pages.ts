import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { heroFields } from '../fields/heroFields'
import { routineBuilderFields } from '../fields/routineBuilderFields'
import { serviceNavigatorFields } from '../fields/serviceNavigatorFields'
import { servicesCarouselFields } from '../fields/servicesCarouselFields'
import { checkoutFields } from '../fields/checkoutFields'
import { protocolSplitFields } from '../fields/protocolSplitFields'
import { dobProtocolDiagnosiFields } from '../fields/dobProtocolDiagnosiFields'
import { dobProtocolTrattamentiFields } from '../fields/dobProtocolTrattamentiFields'
import { dobProtocolRoutineFields } from '../fields/dobProtocolRoutineFields'
import { dobProtocolCheckUpFields } from '../fields/dobProtocolCheckUpFields'
import { privacyContentFields } from '../fields/privacyContentFields'
import { seoFields } from '../fields/seoFields'
import { storyHeroFields } from '../fields/storyHeroFields'
import { storyHeroHomeLegacyFields } from '../fields/storyHeroHomeLegacyFields'
import { storyNoteLegacyFields } from '../fields/storyNoteLegacyFields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  lockDocuments: false,
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
        { label: 'Privacy', value: 'privacy' },
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
          label: 'SEO',
          fields: [...seoFields],
        },
        {
          label: 'Hero Banner',
          admin: {
            condition: (data) =>
              data?.pageKey === 'home' ||
              data?.pageKey === 'our-story' ||
              data?.pageKey === 'shop' ||
              data?.pageKey === 'services',
          },
          fields: [...heroFields],
        },
        {
          label: 'Routine Builder',
          admin: {
            condition: (data) => data?.pageKey === 'shop',
          },
          fields: [...routineBuilderFields],
        },
        {
          label: 'Service Navigator',
          admin: {
            condition: (data) => data?.pageKey === 'services',
          },
          fields: [...serviceNavigatorFields],
        },
        {
          label: 'Service Carousel',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [...servicesCarouselFields],
        },
        {
          label: 'Checkout',
          admin: {
            condition: (data) => data?.pageKey === 'checkout',
          },
          fields: [...checkoutFields],
        },
        {
          label: 'Protocol Split',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [...protocolSplitFields],
        },
        {
          label: 'Diagnosi',
          admin: {
            condition: (data) => data?.pageKey === 'dob-protocol',
          },
          fields: [...dobProtocolDiagnosiFields],
        },
        {
          label: 'Trattamenti',
          admin: {
            condition: (data) => data?.pageKey === 'dob-protocol',
          },
          fields: [...dobProtocolTrattamentiFields],
        },
        {
          label: 'Routine',
          admin: {
            condition: (data) => data?.pageKey === 'dob-protocol',
          },
          fields: [...dobProtocolRoutineFields],
        },
        {
          label: 'Check up',
          admin: {
            condition: (data) => data?.pageKey === 'dob-protocol',
          },
          fields: [...dobProtocolCheckUpFields],
        },
        {
          label: 'Privacy Content',
          admin: {
            condition: (data) => data?.pageKey === 'privacy',
          },
          fields: [...privacyContentFields],
        },
        {
          label: 'Story Hero',
          admin: {
            condition: (data) => data?.pageKey === 'home' || data?.pageKey === 'our-story',
          },
          fields: [...storyHeroFields],
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
    ...storyHeroHomeLegacyFields,
    ...storyNoteLegacyFields,
  ],
  timestamps: true,
}
