import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { CartPageClient } from '@/frontend/components/cart/ui/CartPageClient'
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
    title: 'Carrello | DOB Milano Shop',
    description: 'Carrello acquisti DOB Milano.',
    path: '/cart',
    seo: {
      noIndex: true,
    },
  })
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return <CartPageClient locale={locale} />
}
