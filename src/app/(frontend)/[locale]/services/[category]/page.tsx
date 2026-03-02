import type { Metadata } from 'next'

import ServicesCategoryPage from '@/frontend/page-domains/services/legacy/services-category-page/ServicesCategoryPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}): Promise<Metadata> => {
  const { locale, category } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'treatments',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 0,
    where: {
      slug: { equals: category },
    },
  })

  const treatment = result.docs[0]
  const name = treatment?.boxName || treatment?.cardName || 'Trattamenti estetici'
  const description = treatment?.description || treatment?.boxTagline || `Scopri ${name} a Milano con DOB.`

  return buildSeoMetadata({
    locale,
    title: `${name} a Milano | Servizi Estetici | DOB Milano`,
    description,
    path: `/services/${category}`,
  })
}

export default ServicesCategoryPage
