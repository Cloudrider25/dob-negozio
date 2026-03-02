import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'

export default async function RefundPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-16">
      <h1 className="typo-h1">Refund Policy</h1>
      <p className="mt-4 text-text-secondary">
        Politica resi e rimborsi DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
