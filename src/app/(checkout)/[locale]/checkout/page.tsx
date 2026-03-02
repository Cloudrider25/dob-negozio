import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { CheckoutClient } from '@/frontend/page-domains/checkout/page/CheckoutClient'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const pageResult = await payload.find({
    collection: 'pages',
    locale,
    overrideAccess: false,
    limit: 1,
    where: {
      pageKey: { equals: 'checkout' },
    },
  })
  const checkoutPage = pageResult.docs[0]
  const checkoutNotice =
    checkoutPage && typeof checkoutPage.checkoutNotice === 'string'
      ? checkoutPage.checkoutNotice
      : null

  return <CheckoutClient notice={checkoutNotice} locale={locale} />
}
