import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { CartPageClient } from '@/frontend/components/cart'

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
