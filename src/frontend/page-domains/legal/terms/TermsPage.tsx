import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import styles from './TermsPage.module.css'

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>Terms of Service</h1>
      <p className={styles.subtitle}>
        Termini e condizioni di vendita DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
