import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { getShippingConfig } from '@/lib/frontend/legal/shipping'
import styles from './ShippingPage.module.css'

const titleByLocale = {
  it: 'Shipping policy',
  en: 'Shipping policy',
  ru: 'Shipping policy',
} as const

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const config = await getShippingConfig(locale)

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>{titleByLocale[locale]}</h1>
      <div
        className={`${styles.content} typo-body`}
        dangerouslySetInnerHTML={{ __html: config.html || '' }}
      />
    </main>
  )
}
