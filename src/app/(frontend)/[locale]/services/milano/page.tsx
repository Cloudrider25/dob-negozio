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
    title: 'Servizi Estetici a Milano | Centro Estetico DOB Milano',
    description:
      'Centro estetico a Milano per trattamenti viso e corpo professionali. Prenota la tua consulenza con DOB Milano.',
    path: '/services/milano',
  })
}

export default async function ServicesMilanoPage({
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
      eyebrow="DOB Milano"
      title="Servizi estetici a Milano"
      description="Trattamenti professionali viso e corpo nel cuore di Milano, con consulenza personalizzata."
      bullets={[
        'Consulenza iniziale per definire il protocollo corretto',
        'Tecnologie e trattamenti avanzati per viso e corpo',
        'Percorso personalizzato con monitoraggio dei risultati',
      ]}
      phoneLink={contact.phoneLink}
      whatsappLink={contact.whatsappLink}
    />
  )
}
