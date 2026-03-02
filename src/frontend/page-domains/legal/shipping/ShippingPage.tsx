import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import styles from './ShippingPage.module.css'

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>Shipping Policy</h1>
      <p className={styles.subtitle}>
        Tempi, costi e modalità di spedizione DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
