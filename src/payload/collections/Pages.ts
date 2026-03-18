import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { heroFields } from '../fields/heroFields'
import { homeProgramFields } from '../fields/homeProgramFields'
import { productsCarouselFields } from '../fields/productsCarouselFields'
import { valuesSectionFields } from '../fields/valuesSectionFields'
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
import { termsContentFields } from '../fields/termsContentFields'
import { cookiePolicyContentFields } from '../fields/cookiePolicyContentFields'
import { cookiePolicyBannerFields } from '../fields/cookiePolicyBannerFields'
import { seoFields } from '../fields/seoFields'
import { storyHeroFields } from '../fields/storyHeroFields'
import { storyValuesFields } from '../fields/storyValuesFields'
import { storyTeamFields } from '../fields/storyTeamFields'

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
        { label: 'Programs', value: 'programs' },
        { label: 'Shop', value: 'shop' },
        { label: 'Journal', value: 'journal' },
        { label: 'Location', value: 'location' },
        { label: 'Our Story', value: 'our-story' },
        { label: 'DOB Protocol', value: 'dob-protocol' },
        { label: 'Privacy', value: 'privacy' },
        { label: 'Termini e condizioni', value: 'terms' },
        { label: 'Cookie Policy', value: 'cookie-policy' },
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
              data?.pageKey === 'services' ||
              data?.pageKey === 'programs',
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
            condition: (data) => data?.pageKey === 'home' || data?.pageKey === 'our-story',
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
          label: 'Terms Content',
          admin: {
            condition: (data) => data?.pageKey === 'terms',
          },
          fields: [...termsContentFields],
        },
        {
          label: 'Story Hero',
          admin: {
            condition: (data) => data?.pageKey === 'home' || data?.pageKey === 'our-story',
          },
          fields: [...storyHeroFields],
        },
        {
          label: 'Home Program',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [...homeProgramFields],
        },
        {
          label: 'Product Carousel',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [...productsCarouselFields],
        },
        {
          label: 'Values Section',
          admin: {
            condition: (data) => data?.pageKey === 'home',
          },
          fields: [...valuesSectionFields],
        },
        {
          label: 'Story Values',
          admin: {
            condition: (data) => data?.pageKey === 'our-story',
          },
          fields: [...storyValuesFields],
        },
        {
          label: 'Story Team',
          admin: {
            condition: (data) => data?.pageKey === 'our-story',
          },
          fields: [...storyTeamFields],
        },
        {
          label: 'Cookie Policy Content',
          admin: {
            condition: (data) => data?.pageKey === 'cookie-policy',
          },
          fields: [...cookiePolicyContentFields],
        },
        {
          label: 'Cookie Policy Banner',
          admin: {
            condition: (data) => data?.pageKey === 'cookie-policy',
          },
          fields: [...cookiePolicyBannerFields],
        },
      ],
    },
  ],
  timestamps: true,
}
