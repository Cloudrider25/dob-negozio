import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      localized: true,
      required: true,
      defaultValue: 'DOB - Department of Beauty',
    },
    {
      name: 'address',
      type: 'text',
      localized: true,
      defaultValue: 'Via Giovanni Rasori 9, Milano',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'whatsapp',
      type: 'text',
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
      ],
    },
    {
      name: 'smtp',
      type: 'group',
      admin: {
        description:
          'Configurazione SMTP per invio email. In produzione mantieni sincronizzati questi valori con le variabili ambiente.',
      },
      fields: [
        {
          name: 'host',
          type: 'text',
        },
        {
          name: 'port',
          type: 'number',
          defaultValue: 587,
        },
        {
          name: 'secure',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'user',
          type: 'text',
        },
        {
          name: 'pass',
          type: 'text',
        },
        {
          name: 'from',
          type: 'text',
          defaultValue: 'no-reply@dobmilano.it',
        },
      ],
    },
  ],
}
