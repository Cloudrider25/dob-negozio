import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'
import { CartClient } from '@/components/shop/CartClient'

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return <CartClient locale={locale} />
}
