import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { buildContactLinks } from '@/lib/contact'
import { Hero } from '@/components/Hero'
import { ServicesProtocol } from '@/components/ServicesProtocol'
import { UICCarousel } from '@/components/UIC_Carousel'
import { ServicesToggle } from '@/components/ServicesToggle'
import { ButtonLink } from '@/components/ui/button-link'
import styles from './services-category.module.css'

const fallbackImage = '/media/493b3205c13b5f67b36cf794c2222583.jpg'
const highlightFallbackLeft =
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80'
const highlightFallbackRight =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80'


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
  const payload = await getPayloadClient()
  const fallbackMedia = {
    url: fallbackImage,
    alt: t.services.title,
  }

  const resolveMedia = (media: unknown, fallbackAlt: string = t.services.title) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt, mimeType: typed.mimeType || null }
  }

  const resolveGalleryCover = (gallery: unknown, fallbackAlt: string) => {
    if (!Array.isArray(gallery)) return null
    const entries = gallery
      .map((item) =>
        item && typeof item === 'object'
          ? (item as { media?: unknown; isCover?: boolean })
          : null,
      )
      .filter(Boolean)
    const cover = entries.find((entry) => entry?.isCover) ?? entries[0]
    return cover?.media ? resolveMedia(cover.media, fallbackAlt) : null
  }

  const formatServiceTag = (value?: string | null) => {
    if (value === 'package') return 'Pacchetto'
    if (value === 'single') return 'Singolo'
    return null
  }

  const formatPrice = (value?: number | null, currency = 'EUR') => {
    if (typeof value !== 'number' || Number.isNaN(value)) return null
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    return formatter.format(value)
  }

  const formatDuration = (minutes?: number | null) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) return undefined
    return `${minutes} min`
  }
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

  const services = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    limit: 200,
    sort: 'price',
    where: {
      treatments: {
        in: [categoryDoc.id],
      },
      active: {
        equals: true,
      },
    },
  })
  const matchesType = (value?: string | null) => {
    if (!typeFilter) return true
    return value === typeFilter
  }

  const filteredServices = services.docs.filter((service) => {
    return matchesType(service.serviceType)
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
          { href: whatsappLink, label: 'Prenota', variant: 'primary', external: true },
          { href: phoneLink, label: 'Consulenza', variant: 'outline', external: true },
        ]}
      />
      <ServicesProtocol />
      <section
        className="grid grid-cols-[minmax(220px,320px)_1fr_minmax(220px,320px)] gap-10 px-[2.5vw] py-[var(--s120)] max-[1024px]:grid-cols-1"
        data-header-theme="light"
      >
        <div className={styles.highlightMedia}>
          {highlightImageLeft.mimeType?.startsWith('video/') ? (
            <video src={highlightImageLeft.url} autoPlay muted loop playsInline />
          ) : (
            <Image
              src={highlightImageLeft.url}
              alt={highlightImageLeft.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          )}
        </div>
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="text-[0.75rem] uppercase tracking-[0.4em]">
            {categoryDoc.dobGroup || 'DOB'}
          </span>
          <h2 className="text-[2.6rem] uppercase tracking-[0.12em]">
            Perchè {categoryTitle} da DOB Milano?
          </h2>
          <p className="max-w-[520px]">
            {categoryDoc.highlightLead ||
              'Trattamenti studiati per risultati visibili, texture luminosa e cura profonda.'}
          </p>
          <div className="grid w-full grid-cols-2 gap-8 max-[1024px]:grid-cols-1">
            <div>
              <h3 className="mb-2 text-[1.2rem]">
                {categoryDoc.highlightPointOneTitle || 'Powered by precision'}
              </h3>
              <p className="m-0">
                {categoryDoc.highlightPointOneBody ||
                  'Protocolli mirati, manualità esperte e tecnologie avanzate per potenziare la naturale bellezza.'}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-[1.2rem]">
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
            <video src={highlightImageRight.url} autoPlay muted loop playsInline />
          ) : (
            <Image
              src={highlightImageRight.url}
              alt={highlightImageRight.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          )}
        </div>
      </section>
      <section className="px-[2.5vw] py-[var(--s120)]">
        <div className="flex flex-col gap-6">
          <p className="text-[1.5rem] uppercase tracking-[0.4em]">
            {t.services.title}
          </p>
          <h2 className="text-[2.6rem] uppercase tracking-[0.08em]">
            {categoryTitle}
          </h2>
          <div className="flex items-center justify-between">
            <ServicesToggle currentType={typeFilter} />
          </div>
          <UICCarousel
            items={filteredServices.map((service) => ({
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
            ariaLabel="Services carousel"
            emptyLabel="Nessun servizio disponibile."
          />
          {!filteredServices.length && (
            <p className="text-[0.9rem]">{t.services.note}</p>
          )}
        </div>
      </section>
      <section className="px-[2.5vw] py-[var(--s120)]">
        <div className={`${styles.ctaCard} grid grid-cols-[1.5fr_1fr] gap-8 rounded-[28px] border p-10 max-[900px]:grid-cols-1`}>
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.4em]">
              Prenota ora
            </p>
            <h3>Il tuo percorso di bellezza inizia qui.</h3>
            <p>
              Contattaci su WhatsApp o telefono per una consulenza e un appuntamento su misura.
            </p>
          </div>
          <div className="flex flex-col items-start justify-center gap-4">
            <ButtonLink href={whatsappLink} variant="primary" external>
              Prenota via WhatsApp
            </ButtonLink>
            <ButtonLink href={phoneLink} variant="outline" external>
              Prenota via telefono
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
