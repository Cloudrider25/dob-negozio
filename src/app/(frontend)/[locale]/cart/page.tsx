import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'

export default async function CartPage({
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
    <div className="flex flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{t.cart.title}</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">{t.cart.title}</h1>
        <p className="max-w-[640px] text-text-secondary">{t.cart.lead}</p>
      </header>
      <section className="card p-6 text-text-secondary">
        <p>{t.cart.note}</p>
      </section>
    </div>
  )
}
