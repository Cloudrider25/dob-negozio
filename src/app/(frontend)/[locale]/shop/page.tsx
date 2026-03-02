import type { Metadata } from 'next'

import ShopPage from '@/frontend/page-domains/shop/pages/shop-page/page/ShopPage'
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

  const seo = await getPageSeo(locale, 'shop')

  return buildSeoMetadata({
    locale,
    title: 'Prodotti Estetici Professionali a Milano | DOB Milano Shop',
    description:
      'Acquista prodotti estetici professionali selezionati da DOB Milano per la routine viso e corpo.',
    path: '/shop',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default async function ShopRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{
    q?: string
    brand?: string
    sort?: string
    section?: string
    page?: string
    perPage?: string
    view?: string
  }>
}) {
  const { locale } = await params
  const breadcrumbJsonLd = isLocale(locale)
    ? buildBreadcrumbJsonLd({
        locale,
        items: [
          { name: locale === 'it' ? 'Home' : 'Home', path: '' },
          { name: locale === 'it' ? 'Shop' : 'Shop', path: '/shop' },
        ],
      })
    : null

  return (
    <>
      <ShopPage params={params} searchParams={searchParams} />
      {breadcrumbJsonLd ? <JsonLd id={`breadcrumb-shop-${locale}`} data={breadcrumbJsonLd} /> : null}
    </>
  )
}
