import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { getActiveServicesByTreatmentId } from '@/lib/server/services/queries'
import { buildContactLinks } from '@/lib/frontend/contact/links'
import { Hero } from '@/frontend/components/heroes/Hero'
import { ServicesProtocol } from '@/frontend/page-domains/services/legacy/service-protocol/ServicesProtocol'
import { Carousel } from '@/frontend/components/carousel/ui/Carousel'
import { ButtonLink } from '@/frontend/components/ui/primitives/button-link'
import styles from '@/frontend/page-domains/services/legacy/services-category-page/ServicesCategoryPage.module.css'
import { resolveGalleryCover } from '@/lib/frontend/media/resolve'
import { formatServiceDuration, formatServicePrice } from '@/lib/frontend/services/format'

const fallbackImage = '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg'
const highlightFallbackLeft =
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80'
const highlightFallbackRight =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80'


export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { locale, category } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const fallbackMedia = {
    url: fallbackImage,
    alt: t.services.title,
  }

  const formatServiceTag = (value?: string | null) => {
    if (value === 'package') return 'Pacchetto'
    if (value === 'single') return 'Singolo'
    return null
  }

  const formatPrice = (value?: number | null, currency = 'EUR') =>
    formatServicePrice(value, {
      locale,
      currency,
      maximumFractionDigits: 0,
      invalidValue: null,
    })

  const formatDuration = (minutes?: number | null) => formatServiceDuration(minutes, undefined)
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    overrideAccess: false,
  })
  const { phoneLink, whatsappLink } = buildContactLinks({
    phone: siteSettings?.phone,
    whatsapp: siteSettings?.whatsapp,
  })
  const categoryResult = await payload.find({
    collection: 'treatments',
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

  const categoryTitle = categoryDoc.boxName || categoryDoc.cardName || 'Service category'

  const categoryImage =
    categoryDoc.heroImage && typeof categoryDoc.heroImage === 'object' && 'url' in categoryDoc.heroImage
      ? {
          url: categoryDoc.heroImage.url || fallbackImage,
          alt: categoryDoc.heroImage.alt || categoryTitle,
          mimeType: categoryDoc.heroImage.mimeType || null,
        }
      : {
          url: fallbackImage,
          alt: categoryTitle,
          mimeType: null,
        }

  const highlightImageLeft =
    categoryDoc.highlightImageLeft &&
    typeof categoryDoc.highlightImageLeft === 'object' &&
    'url' in categoryDoc.highlightImageLeft
      ? {
          url: categoryDoc.highlightImageLeft.url || highlightFallbackLeft,
          alt: categoryDoc.highlightImageLeft.alt || 'Detail texture',
          mimeType: categoryDoc.highlightImageLeft.mimeType || null,
        }
      : {
          url: highlightFallbackLeft,
          alt: 'Detail texture',
          mimeType: null,
        }

  const highlightImageRight =
    categoryDoc.highlightImageRight &&
    typeof categoryDoc.highlightImageRight === 'object' &&
    'url' in categoryDoc.highlightImageRight
      ? {
          url: categoryDoc.highlightImageRight.url || highlightFallbackRight,
          alt: categoryDoc.highlightImageRight.alt || 'Eye detail',
          mimeType: categoryDoc.highlightImageRight.mimeType || null,
        }
      : {
          url: highlightFallbackRight,
          alt: 'Eye detail',
          mimeType: null,
        }

  const services = await getActiveServicesByTreatmentId({
    payload,
    locale,
    treatmentId: categoryDoc.id,
    depth: 1,
    limit: 200,
    sort: 'price',
  })
  return (
    <div className="services-category-page flex flex-col gap-10">
      <Hero
        eyebrow={categoryDoc.dobGroup || t.services.title}
        title={categoryTitle || t.services.title}
        description={categoryDoc.description || ''}
        variant="style1"
        mediaDark={categoryImage}
        ctas={[
          { href: whatsappLink, label: 'Prenota', kind: 'hero', external: true },
          { href: phoneLink, label: 'Consulenza', kind: 'hero', external: true },
        ]}
      />
      <ServicesProtocol />
      <section
        className="grid grid-cols-[minmax(220px,320px)_1fr_minmax(220px,320px)] gap-10 px-[2.5vw] py-[var(--s120)] max-[1024px]:grid-cols-1"
        data-header-theme="light"
      >
        <div className={styles.highlightMedia}>
          {highlightImageLeft.mimeType?.startsWith('video/') ? (
            <video src={highlightImageLeft.url} autoPlay muted loop playsInline preload="none" />
          ) : (
            <Image
              src={highlightImageLeft.url}
              alt={highlightImageLeft.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              loading="lazy"
              fetchPriority="auto"
            />
          )}
        </div>
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="typo-caption-upper">
            {categoryDoc.dobGroup || 'DOB'}
          </span>
          <h2 className="typo-h1-upper">
            Perchè {categoryTitle} da DOB Milano?
          </h2>
          <p className="max-w-[520px]">
            {categoryDoc.highlightLead ||
              'Trattamenti studiati per risultati visibili, texture luminosa e cura profonda.'}
          </p>
          <div className="grid w-full grid-cols-2 gap-8 max-[1024px]:grid-cols-1">
            <div>
              <h3 className="mb-2 typo-h3-upper">
                {categoryDoc.highlightPointOneTitle || 'Powered by precision'}
              </h3>
              <p className="m-0">
                {categoryDoc.highlightPointOneBody ||
                  'Protocolli mirati, manualità esperte e tecnologie avanzate per potenziare la naturale bellezza.'}
              </p>
            </div>
            <div>
              <h3 className="mb-2 typo-h3-upper">
                {categoryDoc.highlightPointTwoTitle || 'Safe, gentle, lasting'}
              </h3>
              <p className="m-0">
                {categoryDoc.highlightPointTwoBody ||
                  'Risultati progressivi e duraturi, con attenzione alla sensibilità della pelle e al comfort.'}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.highlightMedia}>
          {highlightImageRight.mimeType?.startsWith('video/') ? (
            <video src={highlightImageRight.url} autoPlay muted loop playsInline preload="none" />
          ) : (
            <Image
              src={highlightImageRight.url}
              alt={highlightImageRight.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              loading="lazy"
              fetchPriority="auto"
            />
          )}
        </div>
      </section>
      <section className="px-[2.5vw] py-[var(--s120)]">
        <div className="flex flex-col gap-6">
          <p className="typo-h3-upper">
            {t.services.title}
          </p>
          <h2 className="typo-h1-upper">
            {categoryTitle}
          </h2>
          <Carousel
            items={services.docs.map((service) => ({
              title: service.name || categoryTitle,
              subtitle: service.description || categoryDoc.description || 'Trattamento su misura.',
              price: formatPrice(service.price, 'EUR'),
              duration: formatDuration(service.durationMinutes),
              image:
                resolveGalleryCover(service.gallery, service.name || categoryTitle) || fallbackMedia,
              tag: formatServiceTag(service.serviceType),
              badgeLeft:
                service.intent && typeof service.intent === 'object' && 'label' in service.intent
                  ? String((service.intent as { label?: string }).label || '')
                  : null,
              badgeRight:
                service.badge && typeof service.badge === 'object' && 'name' in service.badge
                  ? String((service.badge as { name?: string }).name || '')
                  : null,
              href: service.slug ? `/${locale}/services/service/${service.slug}` : undefined,
            }))}
            prioritizeFirstSlideImage
            ariaLabel="Services carousel"
            emptyLabel="Nessun servizio disponibile."
          />
          {!services.docs.length && (
            <p className="typo-body">{t.services.note}</p>
          )}
        </div>
      </section>
      <section className="px-[2.5vw] py-[var(--s120)]">
        <div className={`${styles.ctaCard} grid grid-cols-[1.5fr_1fr] gap-8 rounded-[28px] border p-10 max-[900px]:grid-cols-1`}>
          <div>
            <p className="typo-caption-upper">
              Prenota ora
            </p>
            <h3>Il tuo percorso di bellezza inizia qui.</h3>
            <p>
              Contattaci su WhatsApp o telefono per una consulenza e un appuntamento su misura.
            </p>
          </div>
          <div className="flex flex-col items-start justify-center gap-4">
            <ButtonLink href={whatsappLink} kind="main" external interactive>
              Prenota via WhatsApp
            </ButtonLink>
            <ButtonLink href={phoneLink} kind="main" external interactive>
              Prenota via telefono
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
