import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { getRefundConfig } from '@/lib/frontend/legal/refund'
import styles from './RefundPage.module.css'

const titleByLocale = {
  it: 'Refund policy',
  en: 'Refund policy',
  ru: 'Refund policy',
} as const

export default async function RefundPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const config = await getRefundConfig(locale)

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
