import type { Field } from 'payload'

export const cookiePolicyBannerFields: Field[] = [
  {
    name: 'cookiePolicyBanner',
    label: 'Cookie policy banner',
    type: 'group',
    fields: [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      {
        name: 'body',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'cookiePolicyLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'privacyPolicyLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'storagePreferencesLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'advertisingLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'advertisingDescription',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'personalizationLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'personalizationDescription',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'analyticsLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'analyticsDescription',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'essentialLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'essentialDescription',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'saveLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'acceptAllLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'rejectOptionalLabel',
        type: 'text',
        localized: true,
      },
      {
        name: 'closeLabel',
        type: 'text',
        localized: true,
      },
    ],
  },
]
