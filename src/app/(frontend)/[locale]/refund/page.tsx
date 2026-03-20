import type { Metadata } from 'next'

import RefundPage from '@/frontend/page-domains/legal/refund/RefundPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { getRefundConfig } from '@/lib/frontend/legal/refund'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const config = await getRefundConfig(locale)

  return buildSeoMetadata({
    locale,
    title: 'Resi e Rimborsi | DOB Milano Shop',
    description: 'Politica resi e rimborsi per ordini online e condizioni applicabili su DOB Milano.',
    path: '/refund',
    seo: config.seo ?? undefined,
  })
}

export default RefundPage
