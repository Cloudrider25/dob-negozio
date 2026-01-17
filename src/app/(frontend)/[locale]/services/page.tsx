import { notFound } from 'next/navigation'

import { getPayload } from 'payload'

import { getDictionary, isLocale } from '@/lib/i18n'
import configPromise from '@/payload.config'

const heroImage = '/media/493b3205c13b5f67b36cf794c2222583.jpg'

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayload({ config: await configPromise })
  const categories = await payload.find({
    collection: 'service-categories',
    locale,
    overrideAccess: false,
    where: {
      active: {
        equals: true,
      },
    },
    sort: 'title',
    limit: 100,
  })

  return (
    <div className="page services-page">
      <section className="services-layout">
        <div className="services-image">
          <img src={heroImage} alt="Advanced aesthetics" />
        </div>
        <div className="services-list">
          <p className="services-eyebrow">{t.services.title}</p>
          <h1>{t.services.lead}</h1>
          <div className="services-items">
            {categories.docs.map((category, index) => (
              <a
                key={category.id}
                className="services-item"
                href={`/${locale}/services/${category.slug}`}
              >
                <span className="services-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="services-name">{category.title}</span>
                <span className="services-arrow">↗</span>
              </a>
            ))}
          </div>
          {!categories.totalDocs && <p className="note">{t.services.note}</p>}
        </div>
      </section>
    </div>
  )
}
