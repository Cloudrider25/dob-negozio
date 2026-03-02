import type { Metadata } from 'next'

import ProgramDetailPage from '@/frontend/page-domains/programs/pages/program-detail/page/ProgramDetailPage'
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
    collection: 'programs',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const program = result.docs[0]
  const title = program?.title || 'Programma estetico'
  const description =
    program?.description ||
    `Scopri ${title} e prenota il tuo percorso estetico personalizzato a Milano con DOB.`

  return buildSeoMetadata({
    locale,
    title: `${title} | Programma Estetico Milano | DOB Milano`,
    description,
    path: `/programs/${slug}`,
    seo: {
      title: program?.seo?.title,
      description: program?.seo?.description,
      canonicalPath: program?.seo?.canonicalPath,
      noIndex: program?.seo?.noIndex,
      image: program?.seo?.image,
    },
  })
}

export default ProgramDetailPage
