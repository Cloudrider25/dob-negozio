import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import styles from './ContactPage.module.css'

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>Contact</h1>
      <p className={styles.subtitle}>Per assistenza ordini e informazioni:</p>
      <div className={styles.links}>
        <a className={styles.link} href="mailto:info@dobmilano.it">info@dobmilano.it</a>
      </div>
    </main>
  )
}
