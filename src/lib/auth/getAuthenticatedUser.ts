import { cache } from 'react'
import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/getPayloadClient'
import type { User } from '@/payload-types'

export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  try {
    const payload = await getPayloadClient()
    const incomingHeaders = await headers()
    const result = await payload.auth({ headers: incomingHeaders })

    if (!result?.user) return null
    return result.user as User
  } catch {
    return null
  }
})
