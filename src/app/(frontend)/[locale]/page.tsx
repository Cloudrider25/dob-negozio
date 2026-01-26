import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { Hero } from '@/components/Hero'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { ServicesProtocol } from '@/components/ServicesProtocol'
import styles from './home.module.css'
import { getPayloadClient } from '@/lib/getPayloadClient'

export default async function HomePage({
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
        equals: 'home',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || t.hero.title, mimeType: typed.mimeType || null }
  }
  const darkHeroMedia = resolveMedia(heroMedia?.[0])
  const lightHeroMedia = resolveMedia(heroMedia?.[1])
  const hasHero = Boolean(darkHeroMedia || lightHeroMedia)
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle
      ? pageDoc.heroTitle
      : t.hero.title
  const heroDescription = pageDoc?.heroDescription || t.hero.subtitle

  return (
    <div className="home-page flex flex-col gap-10">
      {hasHero && (
        <Hero
          eyebrow={t.hero.eyebrow}
          title={heroTitle}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={darkHeroMedia || undefined}
          mediaLight={lightHeroMedia || undefined}
          ctas={[
            { href: `/${locale}/services`, label: t.nav.services, variant: 'primary' },
            { href: `/${locale}/shop`, label: t.nav.shop, variant: 'outline' },
          ]}
        />
      )}
      <ServicesProtocol />
      <section className={styles.cardsGrid}>
        <Card variant="pearl" className={styles.card}>
          <h2>{t.story.title}</h2>
          <p className="">{t.story.lead}</p>
          <Link href={`/${locale}/our-story`}>{t.common.discover}</Link>
        </Card>
        <Card variant="pearl" className={`${styles.card} ${styles.cardDelay1}`}>
          <h2>{t.services.title}</h2>
          <p className="">{t.services.lead}</p>
          <Link href={`/${locale}/services`}>{t.common.viewList}</Link>
        </Card>
        <Card variant="pearl" className={`${styles.card} ${styles.cardDelay2}`}>
          <h2>{t.shop.title}</h2>
          <p className="">{t.shop.lead}</p>
          <Link href={`/${locale}/shop`}>{t.common.goToShop}</Link>
        </Card>
      </section>
      <Card variant="pearl" className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <h2>{t.journal.title}</h2>
          <p className="">{t.journal.lead}</p>
        </div>
        <ButtonLink href={`/${locale}/journal`} variant="outline">
          {t.journal.title}
        </ButtonLink>
      </Card>
    </div>
  )
}
