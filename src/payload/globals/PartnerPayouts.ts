import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const PartnerPayouts: GlobalConfig = {
  slug: 'partner-payouts',
  label: 'Partner Payouts',
  admin: {
    group: 'Marketing',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: 'overview',
      type: 'ui',
      admin: {
        components: {
          Field: '/admin/components/PartnerPayoutsOverview',
        },
      },
    },
  ],
}
