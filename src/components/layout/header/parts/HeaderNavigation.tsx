'use client'

import Link from 'next/link'

import { cn } from '@/lib/cn'
import styles from '../Header.module.css'
import type { HeaderTranslations } from '@/components/layout/header/contracts'

type HeaderNavigationProps = {
  locale: string
  t: HeaderTranslations
}

export const HeaderNavigation = ({ locale, t }: HeaderNavigationProps) => {
  return (
    <div className={styles.menuTrigger}>
      <label className={styles.burger} htmlFor="menu-toggle" aria-label="Apri menu">
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </label>
      <nav className={styles.desktopNav} aria-label="Sezioni principali">
        <Link href={`/${locale}/our-story`} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          About
        </Link>
        <Link href={`/${locale}/services`} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          {t.nav.services}
        </Link>
        <Link href={`/${locale}/shop`} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          {t.nav.shop}
        </Link>
      </nav>
    </div>
  )
}
