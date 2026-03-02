import type { Metadata } from 'next'

import AccountPage from '@/frontend/page-domains/account/page/AccountPage'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { isLocale } from '@/lib/i18n/core'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return buildSeoMetadata({
    locale,
    title: 'Area Account | DOB Milano',
    description: 'Area personale account DOB Milano.',
    path: '/account',
    seo: {
      noIndex: true,
    },
  })
}

export default async function AccountRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return <AccountPage params={params} />
}
