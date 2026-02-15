import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Sistema',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Generale',
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
          ],
        },
        {
          label: 'Social',
          fields: [
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
          ],
        },
        {
          label: 'SMTP',
          fields: [
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
        },
        {
          label: 'Stripe',
          fields: [
            {
              name: 'stripe',
              type: 'group',
              admin: {
                description:
                  'Configurazione Stripe checkout/webhook. In produzione mantieni sincronizzati questi valori con le variabili ambiente.',
              },
              fields: [
                {
                  name: 'secretKey',
                  type: 'text',
                },
                {
                  name: 'webhookSecret',
                  type: 'text',
                },
                {
                  name: 'publishableKey',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Sendcloud',
          fields: [
            {
              name: 'sendcloud',
              type: 'group',
              admin: {
                description:
                  'Configurazione Sendcloud API per spedizioni. Le chiavi sono usate lato server.',
              },
              fields: [
                {
                  name: 'publicKey',
                  type: 'text',
                },
                {
                  name: 'secretKey',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
