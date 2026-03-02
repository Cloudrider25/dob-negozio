import type { Metadata } from 'next'

import ShippingPage from '@/frontend/page-domains/legal/shipping/ShippingPage'
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
    title: 'Spedizioni e Consegna | DOB Milano Shop',
    description: 'Informazioni su spedizioni, tempi di consegna e tracking ordini dello shop DOB Milano.',
    path: '/shipping',
  })
}

export default ShippingPage
