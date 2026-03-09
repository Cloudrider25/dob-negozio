import type { Metadata } from 'next'

import CookiePolicyPage from '@/frontend/page-domains/legal/cookie-policy/CookiePolicyPage'
import { getCookiePolicyConfig } from '@/lib/frontend/legal/cookie-policy'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { isLocale } from '@/lib/i18n/core'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const config = await getCookiePolicyConfig(locale)

  return buildSeoMetadata({
    locale,
    title: 'Cookie Policy | DOB Milano',
    description: 'Informativa sui cookie e sulle preferenze di consenso di DOB Milano.',
    path: '/cookie-policy',
    seo: config.seo ?? undefined,
  })
}

export default CookiePolicyPage
