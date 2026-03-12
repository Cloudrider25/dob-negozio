import type { Metadata } from 'next'

import ProgramsPage from '@/frontend/page-domains/programs/pages/programs-page/page/ProgramsPage'
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

  const seo = await getPageSeo(locale, 'programs')

  return buildSeoMetadata({
    locale,
    title: 'Programmi Estetici a Milano | DOB Milano',
    description:
      'Scopri i programmi estetici DOB Milano, percorsi completi costruiti con trattamenti e prodotti selezionati.',
    path: '/programs',
    seo: {
      title: seo?.title,
      description: seo?.description,
      canonicalPath: seo?.canonicalPath,
      noIndex: seo?.noIndex,
      image: seo?.image,
    },
  })
}

export default async function ProgramsRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const breadcrumbJsonLd = isLocale(locale)
    ? buildBreadcrumbJsonLd({
        locale,
        items: [
          { name: locale === 'it' ? 'Home' : 'Home', path: '' },
          { name: locale === 'it' ? 'Programs' : 'Programs', path: '/programs' },
        ],
      })
    : null

  return (
    <>
      <ProgramsPage params={params} />
      {breadcrumbJsonLd ? <JsonLd id={`breadcrumb-programs-${locale}`} data={breadcrumbJsonLd} /> : null}
    </>
  )
}
