import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-16">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-text-secondary">
        Termini e condizioni di vendita DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
