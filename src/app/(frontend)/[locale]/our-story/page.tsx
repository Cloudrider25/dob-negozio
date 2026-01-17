import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'

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

  return (
    <div className="page">
      <section className="page-hero">
        <h1>{t.story.title}</h1>
        <p className="lead">{t.story.lead}</p>
      </section>
      <section className="prose">
        <p>{t.story.body}</p>
      </section>
    </div>
  )
}
