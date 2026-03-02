import type { Metadata } from 'next'

import TermsPage from '@/frontend/page-domains/legal/terms/TermsPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return buildSeoMetadata({
    locale,
    title: 'Termini e Condizioni | DOB Milano',
    description: 'Termini e condizioni di utilizzo dei servizi e dello shop DOB Milano.',
    path: '/terms',
  })
}

export default TermsPage
