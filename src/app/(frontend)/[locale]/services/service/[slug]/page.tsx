import type { Metadata } from 'next'

import { JsonLd } from '@/frontend/components/seo/JsonLd'
import ServiceDetailPage from '@/frontend/page-domains/services/pages/service-detail/page/ServiceDetailPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildServiceJsonLd } from '@/lib/frontend/seo/schema'
import { getServiceBySlug } from '@/lib/server/services/queries'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> => {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const service = await getServiceBySlug({ locale, slug, depth: 1 })
  const name = service?.name || 'Servizio estetico'
  const description = service?.description || `Scopri ${name} a Milano con DOB.`

  return buildSeoMetadata({
    locale,
    title: `${name} a Milano | Servizio Estetico | DOB Milano`,
    description,
    path: `/services/service/${slug}`,
    seo: {
      title: service?.seo?.title,
      description: service?.seo?.description,
      canonicalPath: service?.seo?.canonicalPath,
      noIndex: service?.seo?.noIndex,
      image: service?.seo?.image,
    },
  })
}

export default async function ServiceDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const schemas: Record<string, unknown>[] = []
  if (isLocale(locale)) {
    const service = await getServiceBySlug({ locale, slug, depth: 1 })
    if (service?.name) {
      schemas.push(
        buildBreadcrumbJsonLd({
          locale,
          items: [
            { name: locale === 'it' ? 'Home' : 'Home', path: '' },
            { name: locale === 'it' ? 'Servizi' : 'Services', path: '/services' },
            { name: service.name, path: `/services/service/${slug}` },
          ],
        }),
      )
      schemas.push(
        buildServiceJsonLd({
          locale,
          name: service.name,
          description: service.description,
          path: `/services/service/${slug}`,
          imageUrl:
            service.seo?.image && typeof service.seo.image === 'object' && 'url' in service.seo.image
              ? ((service.seo.image as { url?: unknown }).url as string | undefined) || null
              : null,
          price: typeof service.price === 'number' ? service.price : null,
        }),
      )
      if (Array.isArray(service.faqItems) && service.faqItems.length > 0) {
        const faqJsonLd = buildFaqJsonLd({
          items: service.faqItems.map((item) => ({
            question: typeof item?.q === 'string' ? item.q : '',
            answer: item?.a ?? '',
          })),
        })
        const mainEntity = (faqJsonLd as { mainEntity?: unknown[] }).mainEntity
        if (Array.isArray(mainEntity) && mainEntity.length > 0) {
          schemas.push(faqJsonLd)
        }
      }
    }
  }

  return (
    <>
      <ServiceDetailPage params={params} />
      {schemas.map((schema, index) => (
        <JsonLd key={`service-schema-${index}`} id={`service-schema-${index}`} data={schema} />
      ))}
    </>
  )
}
