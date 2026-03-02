import type { Metadata } from 'next'

import OurStoryPage from '@/frontend/page-domains/our-story/page/OurStoryPage'
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
  const seo = await getPageSeo(locale, 'our-story')

  return buildSeoMetadata({
    locale,
    title: 'Our Story | Centro Estetico DOB Milano',
    description:
      'Scopri la storia, la visione e il metodo di DOB Milano per i trattamenti estetici professionali.',
    path: '/our-story',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default OurStoryPage
