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
    title: 'Epilazione Laser Milano | Percorso Personalizzato DOB Milano',
    description:
      'Epilazione laser a Milano con protocollo su misura. Richiedi consulenza e pianifica il percorso con DOB Milano.',
    path: '/services/epilazione-laser-milano',
  })
}

export default async function EpilazioneLaserMilanoPage({
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
      eyebrow="Laser"
      title="Epilazione laser a Milano"
      description="Un percorso progressivo e personalizzato per ridurre i peli superflui con supporto professionale."
      bullets={[
        'Valutazione iniziale su fototipo e aree da trattare',
        'Programmazione sedute in base al tuo obiettivo',
        'Indicazioni pre/post trattamento per risultati ottimali',
      ]}
      phoneLink={contact.phoneLink}
      whatsappLink={contact.whatsappLink}
    />
  )
}
