import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import styles from './RefundPage.module.css'

export default async function RefundPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>Refund Policy</h1>
      <p className={styles.subtitle}>
        Politica resi e rimborsi DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
