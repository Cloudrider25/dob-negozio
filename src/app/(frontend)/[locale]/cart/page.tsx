import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'
import { CartPageClient } from '@/components/cart/CartPageClient'

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
