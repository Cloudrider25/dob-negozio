'use client'

import Link from 'next/link'

import { buildLocalizedSeoHref } from '@/lib/frontend/seo/routes'
import type { Locale } from '@/lib/i18n/core'
import { cn } from '@/lib/shared/ui/cn'
import styles from '../Header.module.css'
import type { HeaderTranslations } from '@/frontend/layout/header/contracts'

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
        <Link href={buildLocalizedSeoHref(locale as Locale, '/our-story')} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          About
        </Link>
        <Link href={buildLocalizedSeoHref(locale as Locale, '/programs')} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          {t.nav.programs}
        </Link>
        <Link href={buildLocalizedSeoHref(locale as Locale, '/services')} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          {t.nav.services}
        </Link>
        <Link href={buildLocalizedSeoHref(locale as Locale, '/shop')} className={cn(styles.desktopNavLink, 'typo-small-upper')}>
          {t.nav.shop}
        </Link>
      </nav>
    </div>
  )
}
