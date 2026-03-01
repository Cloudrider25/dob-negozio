'use client'

import Image from 'next/image'
import { SiFacebook, SiInstagram, SiWhatsapp } from 'react-icons/si'
import { HiOutlinePhone } from 'react-icons/hi2'

import { MenuLink } from '@/components/layout/header/MenuLink'
import { PreferencesFooterControl } from '@/components/layout/preferences/PreferencesFooterControl'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/cn'
import styles from '../Header.module.css'
import type { HeaderProps } from '@/components/layout/header/contracts'

const directionsHref =
  'https://www.google.com/maps/dir/?api=1&destination=Via+Giovanni+Rasori+9,+20145+Milano,+Italia'

type HeaderMenuOverlayProps = Pick<
  HeaderProps,
  | 'locale'
  | 'accountHref'
  | 't'
  | 'whatsappLink'
  | 'phoneLink'
  | 'instagramLink'
  | 'facebookLink'
  | 'detectedPreferences'
  | 'activePreferences'
  | 'preferencesConfirmed'
  | 'menuHighlights'
> & {
  onCloseMenu: () => void
}

export const HeaderMenuOverlay = ({
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
  onCloseMenu,
}: HeaderMenuOverlayProps) => {
  const closeMenuLinkProps = { onNavigate: onCloseMenu }

  return (
    <div className={styles.menuOverlay}>
      <div className={styles.menuGrid}>
        <div className={styles.menuLeft}>
          <label className={styles.menuClose} htmlFor="menu-toggle" aria-label="Chiudi menu">
            ×
          </label>
          {menuHighlights.length > 0 ? (
            <div className={styles.menuHighlights}>
              {menuHighlights.map((entry) => (
                <MenuLink
                  key={`${entry.type}-${entry.href}`}
                  className={styles.menuHighlightCard}
                  href={entry.href}
                  {...closeMenuLinkProps}
                >
                  <div className={styles.menuHighlightThumb}>
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        fill
                        sizes="52px"
                        className="object-contain"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className={styles.menuHighlightInfo}>
                    <span className={cn(styles.menuHighlightBadge, 'typo-caption-upper')}>New</span>
                    <p className={cn(styles.menuHighlightTitle, 'typo-caption-upper')}>{entry.title}</p>
                  </div>
                </MenuLink>
              ))}
            </div>
          ) : null}
          <div className={styles.menuBooking}>
            <p className={cn(styles.menuSectionLabel, 'm-0', 'typo-caption-upper')}>Get in touch</p>
            <MenuLink
              className={`${styles.menuLink} ${styles.menuLinkIconOnly}`}
              external
              href={whatsappLink}
              {...closeMenuLinkProps}
            >
              <span className={`${styles.menuLinkIcon} ${styles.menuLinkIconWhatsapp}`} aria-hidden="true">
                <SiWhatsapp />
              </span>
              <span className="sr-only">WhatsApp</span>
            </MenuLink>
            <MenuLink
              className={`${styles.menuLink} ${styles.menuLinkIconOnly}`}
              external
              href={phoneLink}
              {...closeMenuLinkProps}
            >
              <span className={`${styles.menuLinkIcon} ${styles.menuLinkIconPhone}`} aria-hidden="true">
                <HiOutlinePhone />
              </span>
              <span className="sr-only">{t.cta.call}</span>
            </MenuLink>
            <MenuLink
              className={`${styles.menuLink} ${styles.menuLinkIconOnly}`}
              external
              href={instagramLink}
              {...closeMenuLinkProps}
            >
              <span className={`${styles.menuLinkIcon} ${styles.menuLinkIconInstagram}`} aria-hidden="true">
                <SiInstagram />
              </span>
              <span className="sr-only">Instagram</span>
            </MenuLink>
            <MenuLink
              className={`${styles.menuLink} ${styles.menuLinkIconOnly}`}
              external
              href={facebookLink}
              {...closeMenuLinkProps}
            >
              <span className={`${styles.menuLinkIcon} ${styles.menuLinkIconFacebook}`} aria-hidden="true">
                <SiFacebook />
              </span>
              <span className="sr-only">Facebook</span>
            </MenuLink>
          </div>
          <p className={cn(styles.menuAddress, 'typo-caption')}>
            Via Giovanni Rasori 9, 20145 Milano, Italia
          </p>
          <MenuLink
            className={cn(styles.menuDirectionsCta, 'typo-caption-upper')}
            external
            href={directionsHref}
            {...closeMenuLinkProps}
          >
            Get directions
          </MenuLink>
          <div className={styles.menuLinks}>
            <MenuLink className={cn(styles.menuLink, 'typo-small-upper')} href={accountHref} {...closeMenuLinkProps}>
              {accountHref.includes('/signin') ? 'Sign in' : 'Account'}
            </MenuLink>
            <MenuLink className={cn(styles.menuLink, 'typo-small-upper')} href={`/${locale}/services`} {...closeMenuLinkProps}>
              {t.nav.services}
            </MenuLink>
            <MenuLink className={cn(styles.menuLink, 'typo-small-upper')} href={`/${locale}/shop`} {...closeMenuLinkProps}>
              {t.nav.shop}
            </MenuLink>
            <MenuLink className={cn(styles.menuLink, 'typo-small-upper')} href={`/${locale}/our-story`} {...closeMenuLinkProps}>
              About
            </MenuLink>
            <MenuLink className={cn(styles.menuLink, 'typo-small-upper')} href={`/${locale}/dob-protocol`} {...closeMenuLinkProps}>
              {t.nav.protocol}
            </MenuLink>
            <MenuLink className={cn(styles.menuLink, 'typo-small-upper')} href={`/${locale}/journal`} {...closeMenuLinkProps}>
              {t.nav.journal}
            </MenuLink>
          </div>
          <div className={styles.menuActions}>
            <ThemeToggle />
            <PreferencesFooterControl
              currentLocale={locale}
              detected={detectedPreferences}
              active={activePreferences}
              initiallyConfirmed={preferencesConfirmed}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
