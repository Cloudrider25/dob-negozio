import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { CheckoutSuccessContent } from '@/frontend/page-domains/checkout/ui/CheckoutSuccessContent'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return buildSeoMetadata({
    locale,
    title: 'Ordine completato | DOB Milano Shop',
    description: 'Riepilogo conferma ordine DOB Milano.',
    path: '/checkout/success',
    seo: {
      noIndex: true,
    },
  })
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ order?: string; attempt?: string; payment_intent?: string }>
}) {
  const { locale } = await params
  const query = await searchParams

  if (!isLocale(locale)) {
    notFound()
  }
  const order = typeof query?.order === 'string' ? query.order : ''
  const attempt = typeof query?.attempt === 'string' ? query.attempt : ''
  const paymentIntent =
    typeof query?.payment_intent === 'string' ? query.payment_intent : ''

  return (
    <CheckoutSuccessContent
      locale={locale}
      initialOrder={order}
      attemptId={attempt}
      paymentIntentId={paymentIntent}
    />
  )
}
