import type { Metadata } from 'next'

import PrivacyPage from '@/frontend/page-domains/legal/privacy/PrivacyPage'
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
    title: 'Privacy Policy | DOB Milano',
    description: 'Informativa privacy di DOB Milano per servizi estetici e shop online.',
    path: '/privacy',
  })
}

export default PrivacyPage
