import Link from 'next/link'
import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-16">
      <h1 className="typo-h1">Contact</h1>
      <p className="mt-4 text-text-secondary">Per assistenza ordini e informazioni:</p>
      <div className="mt-4 space-y-2 text-text-primary">
        <a className="block underline" href="mailto:info@dobmilano.it">info@dobmilano.it</a>
        <Link className="block underline" href={`/${locale}/location`}>Vai alla pagina location</Link>
      </div>
    </main>
  )
}
