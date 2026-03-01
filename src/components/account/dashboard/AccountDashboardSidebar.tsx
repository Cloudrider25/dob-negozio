'use client'

import Link from 'next/link'

import { SectionTitle } from '@/components/sections/SectionTitle'

import { AccountLogoutButton } from '../shared/AccountLogoutButton'
import { getAccountMenuEntries, type AccountMenuEntry } from '../constants'
import type { AccountSection } from '../types'

type SidebarCopy = {
  help: string
  contactUs: string
  fallbackCustomer: string
  overview: { greeting: string }
  addresses: { title: string }
  nav: {
    ariaLabel: string
    addresses: string
  }
}

type AccountDashboardSidebarProps = {
  styles: Record<string, string>
  copy: SidebarCopy
  locale: string
  firstName: string
  section: AccountSection
  setSection: React.Dispatch<React.SetStateAction<AccountSection>>
  prefetchSection: (section: AccountSection) => void
}

function FooterActions({
  styles,
  copy,
  locale,
  className,
}: {
  styles: Record<string, string>
  copy: SidebarCopy
  locale: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className={`${styles.help} typo-body-lg`}>
        {copy.help} <Link href={`/${locale}/contact`}>{copy.contactUs}</Link>
      </p>
      <AccountLogoutButton locale={locale} className="typo-small-upper" label="LOG OUT" />
    </div>
  )
}

export function AccountDashboardSidebar({
  styles,
  copy,
  locale,
  firstName,
  section,
  setSection,
  prefetchSection,
}: AccountDashboardSidebarProps) {
  const menuEntries: AccountMenuEntry[] = getAccountMenuEntries(copy.nav.addresses)

  const mobileSectionTitle =
    section === 'overview'
      ? `${copy.overview.greeting}, ${firstName || copy.fallbackCustomer}`
      : section === 'services'
        ? `Servizi, ${firstName || copy.fallbackCustomer}`
        : section === 'orders'
          ? `Prodotti, ${firstName || copy.fallbackCustomer}`
          : section === 'aesthetic'
            ? `Cartella Estetica, ${firstName || copy.fallbackCustomer}`
            : `${copy.addresses.title}, ${firstName || copy.fallbackCustomer}`

  return (
    <>
      <SectionTitle as="h2" size="h2" className={`${styles.title} ${styles.mobilePageTitle}`}>
        {mobileSectionTitle}
      </SectionTitle>

      <aside className={styles.sidebar}>
        <nav className={styles.menu} aria-label={copy.nav.ariaLabel}>
          {menuEntries.map((entry, index) => {
            if (entry.kind === 'divider') {
              return (
                <div key={`divider-${index}`} className={styles.menuDivider} aria-hidden="true">
                  <span className={`${styles.menuDividerLabel} typo-caption-upper`}>{entry.label}</span>
                </div>
              )
            }

            const isActive = section === entry.section

            return (
              <button
                key={entry.section}
                className={`${styles.menuButton} ${entry.fullWidth ? styles.menuButtonFull : ''} typo-body-lg`}
                type="button"
                onClick={() => setSection(entry.section)}
                onMouseEnter={() => prefetchSection(entry.section)}
                onFocus={() => prefetchSection(entry.section)}
                onPointerDown={() => prefetchSection(entry.section)}
              >
                <span className="typo-body-lg">{entry.label}</span>
                <span className={`${styles.menuDot} ${isActive ? styles.menuDotActive : ''}`} />
              </button>
            )
          })}
        </nav>

        <FooterActions styles={styles} copy={copy} locale={locale} className={styles.sidebarFooter} />
      </aside>

      <FooterActions styles={styles} copy={copy} locale={locale} className={styles.mobileFooterActions} />
    </>
  )
}
