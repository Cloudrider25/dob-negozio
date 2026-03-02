import type { Metadata } from 'next'

import ContactPage from '@/frontend/page-domains/legal/contact/ContactPage'
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
  const seo = await getPageSeo(locale, 'contact')

  return buildSeoMetadata({
    locale,
    title: 'Contatti Centro Estetico Milano | DOB Milano',
    description:
      'Contatta DOB Milano per prenotazioni e consulenze su trattamenti estetici e prodotti professionali.',
    path: '/contact',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default ContactPage
