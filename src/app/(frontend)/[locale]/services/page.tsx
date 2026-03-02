import type { Metadata } from 'next'

import ServicesPage from '@/frontend/page-domains/services/pages/services-page/page/ServicesPage'
import { JsonLd } from '@/frontend/components/seo/JsonLd'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { getPageSeo } from '@/lib/frontend/seo/payload'
import { buildBreadcrumbJsonLd } from '@/lib/frontend/seo/schema'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const seo = await getPageSeo(locale, 'services')

  return buildSeoMetadata({
    locale,
    title: 'Servizi Estetici a Milano | DOB Milano',
    description:
      'Scopri i servizi estetici avanzati di DOB Milano: trattamenti viso e corpo professionali con consulenza personalizzata.',
    path: '/services',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default async function ServicesRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ view?: string; q?: string }>
}) {
  const { locale } = await params
  const breadcrumbJsonLd = isLocale(locale)
    ? buildBreadcrumbJsonLd({
        locale,
        items: [
          { name: locale === 'it' ? 'Home' : 'Home', path: '' },
          { name: locale === 'it' ? 'Servizi' : 'Services', path: '/services' },
        ],
      })
    : null

  return (
    <>
      <ServicesPage params={params} searchParams={searchParams} />
      {breadcrumbJsonLd ? <JsonLd id={`breadcrumb-services-${locale}`} data={breadcrumbJsonLd} /> : null}
    </>
  )
}
