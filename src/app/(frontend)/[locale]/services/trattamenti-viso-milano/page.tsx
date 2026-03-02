import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ServiceMilanoLandingPage from '@/frontend/page-domains/services/pages/local-seo/ServiceMilanoLandingPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { buildContactLinks } from '@/lib/frontend/contact/links'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return buildSeoMetadata({
    locale,
    title: 'Trattamenti Viso a Milano | Estetica Avanzata DOB Milano',
    description:
      'Cerchi trattamenti viso a Milano? Scopri i protocolli professionali DOB Milano per luminosita, tono e texture della pelle.',
    path: '/services/trattamenti-viso-milano',
  })
}

export default async function TrattamentiVisoMilanoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    overrideAccess: false,
  })
  const contact = buildContactLinks({
    phone: siteSettings?.phone,
    whatsapp: siteSettings?.whatsapp,
  })

  return (
    <ServiceMilanoLandingPage
      locale={locale}
      eyebrow="Viso"
      title="Trattamenti viso a Milano"
      description="Percorsi viso professionali per migliorare uniformita, compattezza e luminosita della pelle."
      bullets={[
        'Analisi iniziale e scelta del trattamento piu adatto',
        'Protocolli specifici per idratazione, impurita e anti-age',
        'Abbinamento home-care con prodotti professionali',
      ]}
      phoneLink={contact.phoneLink}
      whatsappLink={contact.whatsappLink}
    />
  )
}
