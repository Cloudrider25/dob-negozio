import type { Metadata } from 'next'

import FaqPage from '@/frontend/page-domains/legal/faq/FaqPage'
import { getFaqConfig } from '@/lib/frontend/legal/faq'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const config = await getFaqConfig(locale)

  return buildSeoMetadata({
    locale,
    title: 'FAQ | DOB Milano',
    description: 'Domande frequenti su trattamenti, prodotti, prenotazioni e assistenza DOB Milano.',
    path: '/faq',
    seo: config.seo ?? undefined,
  })
}

export default FaqPage
