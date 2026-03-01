'use client'

import { useState } from 'react'

import { cn } from '@/lib/cn'
import {
  HeaderActions,
  HeaderBrand,
  HeaderMenuOverlay,
  HeaderNavigation,
} from '@/components/layout/header/parts'
import type { HeaderProps } from '@/components/layout/header/contracts'
import styles from './Header.module.css'

export const Header = ({
  locale,
  accountHref,
  t,
  whatsappLink,
  phoneLink,
  instagramLink,
  facebookLink,
  detectedPreferences,
  activePreferences,
  preferencesConfirmed,
  menuHighlights,
}: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <input
        className={styles.menuToggle}
        id="menu-toggle"
        type="checkbox"
        checked={menuOpen}
        onChange={(event) => setMenuOpen(event.target.checked)}
      />
      <div className={cn(styles.topBar, 'typo-caption-upper')}>prenota una consulenza gratuita</div>
      <header className={styles.header}>
        <HeaderNavigation locale={locale} t={t} />
        <HeaderBrand locale={locale} brandLabel={t.brand} />
        <HeaderActions accountHref={accountHref} />
      </header>
      <HeaderMenuOverlay
        locale={locale}
        accountHref={accountHref}
        t={t}
        whatsappLink={whatsappLink}
        phoneLink={phoneLink}
        instagramLink={instagramLink}
        facebookLink={facebookLink}
        detectedPreferences={detectedPreferences}
        activePreferences={activePreferences}
        preferencesConfirmed={preferencesConfirmed}
        menuHighlights={menuHighlights}
        onCloseMenu={() => setMenuOpen(false)}
      />
    </div>
  )
}
