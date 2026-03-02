import type { Metadata } from 'next'

import RefundPage from '@/frontend/page-domains/legal/refund/RefundPage'
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
    title: 'Resi e Rimborsi | DOB Milano Shop',
    description: 'Politica resi e rimborsi per ordini online e condizioni applicabili su DOB Milano.',
    path: '/refund',
  })
}

export default RefundPage
