import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const InstagramSettings: GlobalConfig = {
  slug: 'instagram-settings',
  admin: {
    group: 'Sistema',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Enable Instagram feed',
    },
    {
      name: 'accessToken',
      type: 'text',
      label: 'Access token',
      admin: {
        description: 'Instagram Basic Display access token.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 12,
      min: 1,
      max: 50,
      label: 'Items limit',
    },
    {
      name: 'revalidateSeconds',
      type: 'number',
      defaultValue: 3600,
      min: 0,
      label: 'Revalidate seconds (0 = no cache)',
    },
  ],
}
