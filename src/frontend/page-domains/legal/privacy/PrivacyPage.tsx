import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import styles from './PrivacyPage.module.css'

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>Privacy Policy</h1>
      <p className={styles.subtitle}>
        Informativa privacy DOB Milano. Versione operativa da integrare con il testo legale finale.
      </p>
    </main>
  )
}
