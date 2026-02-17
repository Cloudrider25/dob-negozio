import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-16">
      <h1 className="typo-h1">Shipping Policy</h1>
      <p className="mt-4 text-text-secondary">
        Tempi, costi e modalità di spedizione DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
