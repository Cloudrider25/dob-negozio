import type { Metadata } from 'next'

import ServiceTreatmentDetailPage from '@/frontend/page-domains/services/legacy/treatment-detail/ServiceTreatmentDetailPage'
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
    collection: 'treatments',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const treatment = result.docs[0]
  const name = treatment?.boxName || treatment?.cardName || 'Trattamento estetico'
  const description = treatment?.description || treatment?.boxTagline || `Scopri ${name} a Milano con DOB.`

  return buildSeoMetadata({
    locale,
    title: `${name} a Milano | Trattamento Estetico | DOB Milano`,
    description,
    path: `/services/treatment/${slug}`,
    seo: {
      title: treatment?.seo?.title,
      description: treatment?.seo?.description,
      canonicalPath: treatment?.seo?.canonicalPath,
      noIndex: treatment?.seo?.noIndex,
      image: treatment?.seo?.image,
    },
  })
}

export default ServiceTreatmentDetailPage
