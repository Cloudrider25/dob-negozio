import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { CartClient } from '@/components/shop/CartClient'

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
    <div className="min-h-screen flex flex-col gap-[var(--s32)] px-[8vw] pb-16">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{t.cart.title}</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">{t.cart.title}</h1>
        <p className="max-w-[640px] text-text-secondary">{t.cart.lead}</p>
      </header>
      <CartClient locale={locale} />
    </div>
  )
}
