import Link from 'next/link'
import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'

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

  const order = typeof query?.order === 'string' ? query.order : ''

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-20">
      <div className="rounded-2xl border border-stroke bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Ordine completato</p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">Grazie per il tuo acquisto</h1>
        <p className="mt-4 text-text-secondary">
          Abbiamo ricevuto il tuo ordine e lo stiamo elaborando.
        </p>
        {order ? (
          <p className="mt-2 text-sm text-text-muted">
            Riferimento ordine: <strong>{order}</strong>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/shop`}
            className="rounded-full border border-stroke px-5 py-2 text-sm text-text-primary"
          >
            Torna allo shop
          </Link>
          <Link
            href={`/${locale}`}
            className="rounded-full bg-accent-cyan px-5 py-2 text-sm text-text-inverse"
          >
            Vai alla home
          </Link>
        </div>
      </div>
    </main>
  )
}
