import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'

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

  return (
    <div className="page home-page">
      <section className="hero hero--home">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title}</h1>
          <p className="lead">{t.hero.subtitle}</p>
          <div className="hero-actions">
            <Link className="cta" href={`/${locale}/services`}>
              {t.nav.services}
            </Link>
            <Link className="cta outline" href={`/${locale}/shop`}>
              {t.nav.shop}
            </Link>
          </div>
          <span className="scroll-hint">{t.common.scroll}</span>
        </div>
      </section>
      <section className="grid">
        <div className="card">
          <h2>{t.story.title}</h2>
          <p>{t.story.lead}</p>
          <Link href={`/${locale}/our-story`}>{t.common.discover}</Link>
        </div>
        <div className="card">
          <h2>{t.services.title}</h2>
          <p>{t.services.lead}</p>
          <Link href={`/${locale}/services`}>{t.common.viewList}</Link>
        </div>
        <div className="card">
          <h2>{t.shop.title}</h2>
          <p>{t.shop.lead}</p>
          <Link href={`/${locale}/shop`}>{t.common.goToShop}</Link>
        </div>
      </section>
      <section className="wide-card">
        <div>
          <h2>{t.journal.title}</h2>
          <p>{t.journal.lead}</p>
        </div>
        <Link className="cta outline" href={`/${locale}/journal`}>
          {t.journal.title}
        </Link>
      </section>
    </div>
  )
}
