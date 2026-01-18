import { notFound } from 'next/navigation'

import { getPayload } from 'payload'

import { getDictionary, isLocale } from '@/lib/i18n'
import configPromise from '@/payload.config'
import { ServicesProtocol } from '@/components/ServicesProtocol'
import { ServicesCarousel } from '@/components/ServicesCarousel'
import { ServicesToggle } from '@/components/ServicesToggle'

const fallbackImage = '/media/493b3205c13b5f67b36cf794c2222583.jpg'
const highlightFallbackLeft =
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80'
const highlightFallbackRight =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80'

const formatPrice = (value: number) => `€${value.toFixed(2)}`
const parseMinutes = (value?: string | null) => {
  if (!value) return null
  const match = value.match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : null
}

export default async function ServiceCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>
  searchParams?: Promise<{ type?: string }>
}) {
  const { locale, category } = await params
  const typeFilter = (await searchParams)?.type?.trim() || ''

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayload({ config: await configPromise })
  const categoryResult = await payload.find({
    collection: 'service-categories',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      slug: {
        equals: category,
      },
    },
  })

  const categoryDoc = categoryResult.docs[0]

  if (!categoryDoc) {
    notFound()
  }

  const categoryImage =
    categoryDoc.heroImage && typeof categoryDoc.heroImage === 'object' && 'url' in categoryDoc.heroImage
      ? categoryDoc.heroImage.url || fallbackImage
      : fallbackImage

  const highlightImageLeft =
    categoryDoc.highlightImageLeft &&
    typeof categoryDoc.highlightImageLeft === 'object' &&
    'url' in categoryDoc.highlightImageLeft
      ? categoryDoc.highlightImageLeft.url || highlightFallbackLeft
      : highlightFallbackLeft

  const highlightImageRight =
    categoryDoc.highlightImageRight &&
    typeof categoryDoc.highlightImageRight === 'object' &&
    'url' in categoryDoc.highlightImageRight
      ? categoryDoc.highlightImageRight.url || highlightFallbackRight
      : highlightFallbackRight

  const services = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    limit: 200,
    sort: 'price',
    where: {
      category: {
        equals: categoryDoc.id,
      },
      active: {
        equals: true,
      },
    },
  })
  const prices = services.docs.map((service) => service.price || 0)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const durations = services.docs
    .map((service) => parseMinutes(service.duration))
    .filter((value): value is number => value !== null)
  const minDuration = durations.length ? Math.min(...durations) : null
  const maxDuration = durations.length ? Math.max(...durations) : null

  const matchesType = (value?: string | null) => {
    if (!typeFilter) return true
    return value === typeFilter
  }

  const filteredServices = services.docs.filter((service) => {
    return matchesType(service.serviceType)
  })

  return (
    <div className="page services-page services-category-page">
      <section className="services-hero services-hero--full">
        <div className="services-hero-text">
          <div className="services-hero-meta">
            <span className="services-hero-index">001</span>
            <span className="services-hero-group">{categoryDoc.dobGroup || 'DOB'}</span>
          </div>
          <h1>{categoryDoc.title}</h1>
          <div className="services-hero-proof">
            <span>
              Durata{' '}
              {minDuration && maxDuration ? `${minDuration}-${maxDuration} min` : 'su misura'}
            </span>
            <span>Da {formatPrice(minPrice || 0)}</span>
            <span>Tecnologia {categoryDoc.dobGroup || 'Avanzata'}</span>
          </div>
          {categoryDoc.description && (
            <div className="services-hero-description">
              <div className="services-hero-scrollline">
                <span className="services-hero-scroll">Scroll</span>
                <div className="services-hero-divider" />
              </div>
              <p>{categoryDoc.description}</p>
            </div>
          )}
          <div className="services-hero-actions">
            <a className="cta" href="https://wa.me/39XXXXXXXXXX">
              Prenota
            </a>
            <a className="cta outline" href="tel:+39XXXXXXXXXX">
              Consulenza
            </a>
          </div>
        </div>
        <div className="services-hero-image">
          <img src={categoryImage} alt={categoryDoc.title || 'Service category'} />
        </div>
      </section>
      <section className="services-highlight">
        <div className="services-highlight-media">
          <img src={highlightImageLeft} alt="Detail texture" />
        </div>
        <div className="services-highlight-content">
          <span className="services-highlight-eyebrow">{categoryDoc.dobGroup || 'DOB'}</span>
          <h2>Perchè {categoryDoc.title} da DOB Milano?</h2>
          <p className="services-highlight-lead">
            {categoryDoc.highlightLead ||
              'Trattamenti studiati per risultati visibili, texture luminosa e cura profonda.'}
          </p>
          <div className="services-highlight-grid">
            <div>
              <h3>{categoryDoc.highlightPointOneTitle || 'Powered by precision'}</h3>
              <p>
                {categoryDoc.highlightPointOneBody ||
                  'Protocolli mirati, manualità esperte e tecnologie avanzate per potenziare la naturale bellezza.'}
              </p>
            </div>
            <div>
              <h3>{categoryDoc.highlightPointTwoTitle || 'Safe, gentle, lasting'}</h3>
              <p>
                {categoryDoc.highlightPointTwoBody ||
                  'Risultati progressivi e duraturi, con attenzione alla sensibilità della pelle e al comfort.'}
              </p>
            </div>
          </div>
        </div>
        <div className="services-highlight-media right">
          <img src={highlightImageRight} alt="Eye detail" />
        </div>
      </section>
      <ServicesProtocol />
      <section className="services-category-list">
        <div className="services-list">
          <p className="services-eyebrow">{t.services.title}</p>
          <h2>{categoryDoc.title}</h2>
          <div className="services-tools">
            <ServicesToggle currentType={typeFilter} />
          </div>
          <ServicesCarousel
            items={filteredServices.map((service) => ({
              id: service.id,
              name: service.name,
              description: service.description || categoryDoc.description || 'Trattamento su misura.',
            }))}
            groupLabel={categoryDoc.dobGroup || 'DOB'}
            imageLeft={highlightImageLeft}
            imageRight={highlightImageRight}
            autoplayMs={5200}
          />
          {!filteredServices.length && <p className="note">{t.services.note}</p>}
        </div>
      </section>
      <section className="services-cta">
        <div className="services-cta-card">
          <div>
            <p className="services-cta-eyebrow">Prenota ora</p>
            <h3>Il tuo percorso di bellezza inizia qui.</h3>
            <p>
              Contattaci su WhatsApp o telefono per una consulenza e un appuntamento su misura.
            </p>
          </div>
          <div className="services-cta-actions">
            <a className="cta" href="https://wa.me/39XXXXXXXXXX">
              Prenota via WhatsApp
            </a>
            <a className="cta outline" href="tel:+39XXXXXXXXXX">
              Prenota via telefono
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
