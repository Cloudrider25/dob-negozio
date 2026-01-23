import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { Hero } from '@/components/Hero'

export default async function JournalPage({
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
        equals: 'journal',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || t.journal.title, mimeType: typed.mimeType || null }
  }
  const heroDark = resolveMedia(heroMedia?.[0])
  const heroLight = resolveMedia(heroMedia?.[1])
  const hasHero = Boolean(heroDark || heroLight)
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle
      ? pageDoc.heroTitle
      : t.journal.title
  const heroDescription = pageDoc?.heroDescription || t.journal.lead

  return (
    <div className="flex flex-col gap-10">
      {hasHero && (
        <Hero
          eyebrow={t.journal.title}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
        />
      )}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            className="relative rounded-[var(--r20)] border p-6 before:absolute before:inset-0 before:content-['']"
            key={`post-${index}`}
          >
            <h3>{t.placeholders.journalTitle}</h3>
            <p className="">{t.placeholders.journalExcerpt}</p>
            <span className="text-[0.85rem] uppercase tracking-[0.08em]">
              {t.placeholders.readMore}
            </span>
          </article>
        ))}
      </section>
    </div>
  )
}
