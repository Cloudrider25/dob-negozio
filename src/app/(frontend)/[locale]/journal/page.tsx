import type { Metadata } from 'next'

import JournalPage from '@/frontend/page-domains/journal/page/JournalPage'
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
  const seo = await getPageSeo(locale, 'journal')

  return buildSeoMetadata({
    locale,
    title: 'Journal Beauty Milano | Guide e Consigli | DOB Milano',
    description:
      'Approfondimenti, consigli e contenuti beauty dal team DOB Milano su trattamenti e skincare professionale.',
    path: '/journal',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default JournalPage
