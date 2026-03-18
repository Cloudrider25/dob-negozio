import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { getTermsConfig } from '@/lib/frontend/legal/terms'
import styles from './TermsPage.module.css'

const titleByLocale = {
  it: 'Termini e condizioni',
  en: 'Terms of Service',
  ru: 'Условия использования',
} as const

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const config = await getTermsConfig(locale)

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
