import Image from 'next/image'
import type { ReactNode } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'

import styles from './AuthSplitLayout.module.css'

export function AuthSplitLayout({ children, locale }: { children: ReactNode; locale: string }) {
  const copy = getAccountDictionary(locale).authLayout

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.visual} aria-hidden>
          <Image
            src="/media/493b3205c13b5f67b36cf794c2222583.jpg"
            alt=""
            fill
            priority
            className={styles.image}
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          <p className={`${styles.overlay} typo-display-upper`}>{copy.visualOverlay}</p>
        </aside>
        <section className={styles.formCol}>
          <div className={styles.formWrap}>{children}</div>
        </section>
      </div>
    </div>
  )
}
