import { notFound } from 'next/navigation'

import { ContactRequestForm } from '@/frontend/page-domains/legal/contact/ContactRequestForm'
import { getContactConfig } from '@/lib/frontend/legal/contact'
import { isLocale } from '@/lib/i18n/core'
import styles from './ContactPage.module.css'

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const config = await getContactConfig(locale)

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>{config.title}</h1>
      <div
        className={`${styles.content} typo-body`}
        dangerouslySetInnerHTML={{ __html: config.html }}
      />
      <ContactRequestForm locale={locale} />
    </main>
  )
}
