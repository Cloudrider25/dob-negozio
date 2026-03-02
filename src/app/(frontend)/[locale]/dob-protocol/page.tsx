import type { Metadata } from 'next'

import DobProtocolPage from '@/frontend/page-domains/dob-protocol/page/DobProtocolPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { getPageSeo } from '@/lib/frontend/seo/payload'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const seo = await getPageSeo(locale, 'dob-protocol')

  return buildSeoMetadata({
    locale,
    title: 'DOB Protocol | Metodo Estetico DOB Milano',
    description:
      'Scopri il DOB Protocol: il metodo con cui costruiamo percorsi estetici personalizzati a Milano.',
    path: '/dob-protocol',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default DobProtocolPage
