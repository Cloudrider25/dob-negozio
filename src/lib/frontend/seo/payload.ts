import { cache } from 'react'

import type { Locale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export type FrontendPageKey =
  | 'home'
  | 'services'
  | 'programs'
  | 'shop'
  | 'journal'
  | 'location'
  | 'our-story'
  | 'dob-protocol'
  | 'faq'
  | 'contact'
  | 'checkout'

export const getPageSeo = cache(async (locale: Locale, pageKey: FrontendPageKey) => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      locale,
      overrideAccess: false,
      limit: 1,
      depth: 1,
      where: {
        pageKey: {
          equals: pageKey,
        },
      },
    })

    return result.docs[0]?.seo ?? null
  } catch (error) {
    console.error(`[seo] Failed to load SEO config for page "${pageKey}" (${locale}).`, error)
    return null
  }
})
