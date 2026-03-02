import type { Metadata } from 'next'

import HomePage from '@/frontend/page-domains/home/page/HomePage'
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
  if (!isLocale(locale)) return {}

  const seo = await getPageSeo(locale, 'home')

  return buildSeoMetadata({
    locale,
    title: 'Centro Estetico Milano | Trattamenti e Prodotti | DOB Milano',
    description:
      'DOB Milano: centro estetico a Milano per trattamenti viso e corpo avanzati e prodotti professionali.',
    path: '',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default async function HomeRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const breadcrumbJsonLd = isLocale(locale)
    ? buildBreadcrumbJsonLd({
        locale,
        items: [{ name: locale === 'it' ? 'Home' : 'Home', path: '' }],
      })
    : null

  return (
    <>
      <HomePage params={params} />
      {breadcrumbJsonLd ? <JsonLd id={`breadcrumb-home-${locale}`} data={breadcrumbJsonLd} /> : null}
    </>
  )
}
