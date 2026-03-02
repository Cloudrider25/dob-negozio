import type { Metadata } from 'next'

import ServiceGoalDetailPage from '@/frontend/page-domains/services/legacy/goal-detail/ServiceGoalDetailPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> => {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'objectives',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const goal = result.docs[0]
  const name = goal?.boxName || 'Obiettivo estetico'
  const description = goal?.boxTagline || `Scopri soluzioni per ${name} a Milano con DOB.`

  return buildSeoMetadata({
    locale,
    title: `${name} a Milano | Obiettivi Beauty | DOB Milano`,
    description,
    path: `/services/goal/${slug}`,
    seo: {
      title: goal?.seo?.title,
      description: goal?.seo?.description,
      canonicalPath: goal?.seo?.canonicalPath,
      noIndex: goal?.seo?.noIndex,
      image: goal?.seo?.image,
    },
  })
}

export default ServiceGoalDetailPage
