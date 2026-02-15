import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getJourneyDictionary, isLocale } from '@/lib/i18n'

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ order?: string }>
}) {
  const { locale } = await params
  const query = await searchParams

  if (!isLocale(locale)) {
    notFound()
  }
  const copy = getJourneyDictionary(locale).checkoutSuccess

  const order = typeof query?.order === 'string' ? query.order : ''

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-20">
      <div className="rounded-2xl border border-stroke bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{copy.orderCompleted}</p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">{copy.thankYou}</h1>
        <p className="mt-4 text-text-secondary">{copy.processingOrder}</p>
        {order ? (
          <p className="mt-2 text-sm text-text-muted">
            {copy.orderReference}: <strong>{order}</strong>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/shop`}
            className="rounded-full border border-stroke px-5 py-2 text-sm text-text-primary"
          >
            {copy.backToShop}
          </Link>
          <Link
            href={`/${locale}`}
            className="rounded-full bg-accent-cyan px-5 py-2 text-sm text-text-inverse"
          >
            {copy.goHome}
          </Link>
        </div>
      </div>
    </main>
  )
}
