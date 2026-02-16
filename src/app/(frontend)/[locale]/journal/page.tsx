import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import Image from 'next/image'
import { Hero } from '@/components/heroes/Hero'
import styles from './journal.module.css'

type InstagramMediaItem = {
  id: string
  caption?: string
  media_url?: string
  media_type?: string
  permalink?: string
  thumbnail_url?: string
}

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
  const heroDescription = pageDoc?.heroDescription ?? t.journal.lead
  const instagramSettings = await payload.findGlobal({
    slug: 'instagram-settings',
    overrideAccess: true,
  })

  let instagramItems: InstagramMediaItem[] = []

  if (instagramSettings?.enabled && instagramSettings?.accessToken) {
    const limit = Math.min(Math.max(instagramSettings.limit || 12, 1), 50)
    const revalidateSeconds = Math.max(instagramSettings.revalidateSeconds || 0, 0)
    const url = new URL('https://graph.instagram.com/me/media')
    url.searchParams.set(
      'fields',
      'id,caption,media_url,media_type,permalink,thumbnail_url,timestamp',
    )
    url.searchParams.set('access_token', instagramSettings.accessToken)
    url.searchParams.set('limit', String(limit))

    try {
      const response = await fetch(url.toString(), {
        next: revalidateSeconds > 0 ? { revalidate: revalidateSeconds } : undefined,
        cache: revalidateSeconds > 0 ? 'force-cache' : 'no-store',
      })
      if (response.ok) {
        const data = (await response.json()) as { data?: InstagramMediaItem[] }
        if (Array.isArray(data.data)) {
          instagramItems = data.data.filter((item) => item.media_url || item.thumbnail_url)
        }
      }
    } catch {
      instagramItems = []
    }
  }

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
      {instagramItems.length > 0 ? (
        <section className={styles.grid}>
          {instagramItems.map((item) => {
            const mediaUrl =
              item.media_type === 'VIDEO' && item.thumbnail_url
                ? item.thumbnail_url
                : item.media_url
            if (!mediaUrl) return null
            return (
              <a
                key={item.id}
                className={styles.card}
                href={item.permalink || '#'}
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  className={styles.media}
                  src={mediaUrl}
                  alt={item.caption || t.journal.title}
                  width={640}
                  height={640}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {item.caption && (
                  <span className={styles.caption}>{item.caption.slice(0, 120)}</span>
                )}
              </a>
            )
          })}
        </section>
      ) : (
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
      )}
    </div>
  )
}
