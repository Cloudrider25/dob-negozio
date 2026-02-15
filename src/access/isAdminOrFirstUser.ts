import type { Access } from 'payload'

import { isAdmin } from './isAdmin'

export const isAdminOrFirstUser: Access = async ({ req }) => {
  if (isAdmin({ req })) return true

  const users = await req.payload.find({
    collection: 'users',
    limit: 0,
    overrideAccess: true,
  })

  return users.totalDocs === 0
}
