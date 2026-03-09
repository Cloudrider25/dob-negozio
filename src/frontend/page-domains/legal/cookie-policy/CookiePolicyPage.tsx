import { notFound } from 'next/navigation'

import { getCookiePolicyConfig } from '@/lib/frontend/legal/cookie-policy'
import { isLocale } from '@/lib/i18n/core'
import styles from './CookiePolicyPage.module.css'

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const config = await getCookiePolicyConfig(locale)

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>{config.page.title}</h1>
      <p className={`typo-body ${styles.subtitle}`}>{config.page.intro}</p>

      <div className={styles.sections}>
        {config.page.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={`typo-h4 ${styles.sectionTitle}`}>{section.title}</h2>
            <p className={`typo-body ${styles.sectionBody}`}>{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
