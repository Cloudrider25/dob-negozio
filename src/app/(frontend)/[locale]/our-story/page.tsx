import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import styles from './our-story.module.css'

export default async function OurStoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <div className={styles.page}>
      <div className={styles.cover} />
    </div>
  )
}
