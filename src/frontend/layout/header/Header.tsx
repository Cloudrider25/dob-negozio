'use client'

import Link from 'next/link'
import { useState } from 'react'

import { cn } from '@/lib/shared/ui/cn'
import {
  HeaderActions,
  HeaderBrand,
  HeaderMenuOverlay,
  HeaderNavigation,
} from '@/frontend/layout/header/parts'
import type { HeaderProps } from '@/frontend/layout/header/contracts'
import styles from './Header.module.css'

export const Header = ({
  locale,
  accountHref,
  t,
  addressDisplay,
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
  const isItalian = locale === 'it'
  const fallbackHref = `/${locale}/contact`
  const primaryHref = whatsappLink || phoneLink || fallbackHref
  const primaryIsInternal = primaryHref.startsWith('/')
  const proofText =
    isItalian
      ? `Centro estetico a Milano${addressDisplay ? ` - ${addressDisplay}` : ''}`
      : `Beauty center in Milan${addressDisplay ? ` - ${addressDisplay}` : ''}`

  return (
    <div className={styles.shell}>
      <input
        className={styles.menuToggle}
        id="menu-toggle"
        type="checkbox"
        checked={menuOpen}
        onChange={(event) => setMenuOpen(event.target.checked)}
      />
      <div className={styles.topBar} aria-label={isItalian ? 'Prova locale e prenotazione' : 'Local proof and booking'}>
        <div className={styles.topBarInner}>
          <p className={styles.topBarProof}>{proofText}</p>
          <div className={styles.topBarActions}>
            {primaryIsInternal ? (
              <Link href={primaryHref} className={cn(styles.topBarPrimary, 'typo-caption-upper')}>
                {isItalian ? 'Prenota consulenza' : 'Book consultation'}
              </Link>
            ) : (
              <a href={primaryHref} className={cn(styles.topBarPrimary, 'typo-caption-upper')}>
                {isItalian ? 'Prenota consulenza' : 'Book consultation'}
              </a>
            )}
            <Link href={fallbackHref} className={cn(styles.topBarSecondary, 'typo-caption-upper')}>
              {isItalian ? 'Contattaci' : 'Contact us'}
            </Link>
          </div>
        </div>
      </div>
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
