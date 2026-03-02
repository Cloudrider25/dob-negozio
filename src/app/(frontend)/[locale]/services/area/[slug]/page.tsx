import type { Metadata } from 'next'

import ServiceAreaDetailPage from '@/frontend/page-domains/services/legacy/area-detail/ServiceAreaDetailPage'
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
    collection: 'areas',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const area = result.docs[0]
  const name = area?.name || 'Area estetica'
  const description = area?.boxTagline || `Scopri trattamenti per ${name} a Milano con DOB.`

  return buildSeoMetadata({
    locale,
    title: `${name} a Milano | Trattamenti Estetici | DOB Milano`,
    description,
    path: `/services/area/${slug}`,
    seo: {
      title: area?.seo?.title,
      description: area?.seo?.description,
      canonicalPath: area?.seo?.canonicalPath,
      noIndex: area?.seo?.noIndex,
      image: area?.seo?.image,
    },
  })
}

export default ServiceAreaDetailPage
