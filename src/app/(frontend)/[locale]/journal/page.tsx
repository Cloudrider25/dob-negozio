import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'

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

  return (
    <div className="page">
      <section className="page-hero">
        <h1>{t.journal.title}</h1>
        <p className="lead">{t.journal.lead}</p>
      </section>
      <section className="grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <article className="card" key={`post-${index}`}>
            <h3>{t.placeholders.journalTitle}</h3>
            <p>{t.placeholders.journalExcerpt}</p>
            <span className="meta">{t.placeholders.readMore}</span>
          </article>
        ))}
      </section>
    </div>
  )
}
