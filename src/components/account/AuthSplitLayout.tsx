import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import type { Locale } from '@/lib/i18n'

import styles from './AuthSplitLayout.module.css'

export async function AuthSplitLayout({ children, locale }: { children: ReactNode; locale: Locale }) {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    depth: 1,
  })
  const copy = getAccountDictionary(locale).authLayout
  const visualOverlay = siteSettings?.authLayout?.visualOverlay || copy.visualOverlay
  const visualImage =
    siteSettings?.authLayout?.visualImage &&
    typeof siteSettings.authLayout.visualImage === 'object' &&
    'url' in siteSettings.authLayout.visualImage
      ? siteSettings.authLayout.visualImage.url
      : null
  const visualImageAlt = siteSettings?.authLayout?.visualImageAlt || ''
  const visualImageSrc = visualImage || '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg'

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.visual} aria-hidden>
          <Image
            src={visualImageSrc}
            alt={visualImageAlt}
            fill
            priority
            className={styles.image}
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          <p className={`${styles.overlay} typo-display-upper`}>{visualOverlay}</p>
        </aside>
        <section className={styles.formCol}>
          <Link href={`/${locale}`} className={styles.brand} aria-label="DOB">
            <span className={styles.brandMark}>
              <Image
                className={styles.logoDark}
                src="/brand/logo-black.png"
                alt=""
                width={54}
                height={54}
                priority
              />
              <Image
                className={styles.logoLight}
                src="/brand/logo-white.png"
                alt=""
                width={54}
                height={54}
                priority
              />
            </span>
            <p className={`${styles.brandTitle} typo-display-upper`}>DOB</p>
          </Link>
          <div className={styles.formWrap}>{children}</div>
        </section>
      </div>
    </div>
  )
}
