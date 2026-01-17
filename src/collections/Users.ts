import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField } from '../access/isAdmin'
import { isAdminOrFirstUser } from '../access/isAdminOrFirstUser'
import { isAdminOrSelf } from '../access/isAdminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: isAdminOrSelf,
    create: isAdminOrFirstUser,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    // Email added by default
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor'],
      defaultValue: ['editor'],
      required: true,
      saveToJWT: true,
      access: {
        update: isAdminField,
      },
    },
  ],
}
