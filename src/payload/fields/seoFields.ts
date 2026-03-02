import type { Field } from 'payload'

export const seoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description: 'Impostazioni SEO specifiche per questa pagina.',
    },
    fields: [
      {
        name: 'title',
        label: 'Meta title',
        type: 'text',
        localized: true,
      },
      {
        name: 'description',
        label: 'Meta description',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'canonicalPath',
        label: 'Canonical path',
        type: 'text',
        admin: {
          description: 'Path relativo senza locale. Esempio: /services/service/laser-viso',
        },
      },
      {
        name: 'noIndex',
        label: 'Noindex',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'image',
        label: 'Open Graph image',
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
]
