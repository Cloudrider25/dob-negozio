import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import { getPrivacyConfig } from '@/lib/frontend/legal/privacy'
import styles from './PrivacyPage.module.css'

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const config = await getPrivacyConfig(locale)

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>Privacy Policy</h1>
      <div
        className={`${styles.content} typo-body`}
        dangerouslySetInnerHTML={{ __html: config.html || '' }}
      />
    </main>
  )
}
