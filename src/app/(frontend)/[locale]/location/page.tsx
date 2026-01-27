import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { buildContactLinks } from '@/lib/contact'
import { Hero } from '@/components/Hero'

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const pageConfig = await payload.find({
    collection: 'pages',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      pageKey: {
        equals: 'location',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    overrideAccess: false,
  })
  const { phoneDisplay, whatsappDisplay, addressDisplay } = buildContactLinks({
    phone: siteSettings?.phone,
    whatsapp: siteSettings?.whatsapp,
    address: siteSettings?.address,
  })
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || t.location.title, mimeType: typed.mimeType || null }
  }
  const heroDark = resolveMedia(heroMedia?.[0])
  const heroLight = resolveMedia(heroMedia?.[1])
  const hasHero = Boolean(heroDark || heroLight)
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle
      ? pageDoc.heroTitle
      : t.location.title
  const heroDescription = pageDoc?.heroDescription ?? t.location.lead

  return (
    <div className="flex flex-col gap-10">
      {hasHero && (
        <Hero
          eyebrow={t.location.title}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
        />
      )}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        <div className="relative rounded-[var(--r20)] border p-6 before:absolute before:inset-0 before:content-['']">
          <h3>{t.placeholders.addressLabel}</h3>
          <p className="">{addressDisplay}</p>
          <p className="">{t.placeholders.cityLine}</p>
        </div>
        <div className="relative rounded-[var(--r20)] border p-6 before:absolute before:inset-0 before:content-['']">
          <h3>{t.placeholders.hoursLabel}</h3>
          <p className="">{t.location.hours}</p>
          <p className="">{t.placeholders.weekdayLabel}</p>
        </div>
        <div className="relative rounded-[var(--r20)] border p-6 before:absolute before:inset-0 before:content-['']">
          <h3>{t.placeholders.contactLabel}</h3>
          <p className="">WhatsApp: {whatsappDisplay}</p>
          <p className="">Telefono: {phoneDisplay}</p>
        </div>
      </section>
    </div>
  )
}
