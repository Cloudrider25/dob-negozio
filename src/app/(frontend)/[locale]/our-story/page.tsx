import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { Hero } from '@/components/Hero'

export default async function OurStoryPage({
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
        equals: 'our-story',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || t.story.title, mimeType: typed.mimeType || null }
  }
  const heroDark = resolveMedia(heroMedia?.[0])
  const heroLight = resolveMedia(heroMedia?.[1])
  const hasHero = Boolean(heroDark || heroLight)
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle
      ? pageDoc.heroTitle
      : t.story.title
  const heroDescription = pageDoc?.heroDescription || t.story.lead

  return (
    <div className="flex flex-col gap-10">
      {hasHero && (
        <Hero
          eyebrow={t.story.title}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
        />
      )}
      <section className="max-w-[680px]">
        <p>{t.story.body}</p>
      </section>
    </div>
  )
}
