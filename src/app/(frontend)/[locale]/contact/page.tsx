import type { Metadata } from 'next'

import ContactPage from '@/frontend/page-domains/legal/contact/ContactPage'
import { getContactConfig } from '@/lib/frontend/legal/contact'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const config = await getContactConfig(locale)

  return buildSeoMetadata({
    locale,
    title: 'Contatti Centro Estetico Milano | DOB Milano',
    description:
      'Contatta DOB Milano per prenotazioni e consulenze su trattamenti estetici e prodotti professionali.',
    path: '/contact',
    seo: config.seo ?? undefined,
  })
}

export default ContactPage
