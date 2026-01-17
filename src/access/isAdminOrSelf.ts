import type { Access } from 'payload'

import { isAdmin } from './isAdmin'

export const isAdminOrSelf: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  if (!req.user) return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}
