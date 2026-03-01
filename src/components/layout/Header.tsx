import Image from 'next/image'
import Link from 'next/link'

import { MenuLink } from '@/components/layout/MenuLink'
import { PreferencesFooterControl } from '@/components/layout/PreferencesFooterControl'
import { SearchDrawerTrigger } from '@/components/layout/SearchDrawerTrigger'
import { CartDrawerTrigger, CartDrawerIconTrigger } from '@/components/cart'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { type UserPreferences } from '@/lib/user-preferences'
import { Search, ShoppingBag } from '@/components/ui/icons'
import { SiWhatsapp, SiInstagram, SiFacebook } from 'react-icons/si'
import { HiOutlinePhone } from 'react-icons/hi2'
import styles from './Header.module.css'

type MenuHighlight = {
  type: 'product' | 'service'
  title: string
  href: string
  image: string | null
}

const directionsHref =
  'https://www.google.com/maps/dir/?api=1&destination=Via+Giovanni+Rasori+9,+20145+Milano,+Italia'

type HeaderProps = {
  locale: string
  accountHref: string
  t: {
    brand: string
    nav: {
      story: string
      protocol: string
      journal: string
      location: string
      services: string
      shop: string
    }
    cta: {
      appointment: string
      whatsapp: string
      call: string
    }
  }
  whatsappLink: string
  phoneLink: string
  instagramLink: string
  facebookLink: string
  detectedPreferences: UserPreferences
  activePreferences: UserPreferences
  preferencesConfirmed: boolean
  menuHighlights: MenuHighlight[]
}

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
  return (
    <div className={styles.shell}>
      <input className={styles.menuToggle} id="menu-toggle" type="checkbox" />
      <div className={`${styles.topBar} typo-caption-upper`}>prenota una consulenza gratuita</div>
      <header className={styles.header}>
        <div className={styles.menuTrigger}>
          <label className={styles.burger} htmlFor="menu-toggle" aria-label="Apri menu">
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </label>
          <nav className={styles.desktopNav} aria-label="Sezioni principali">
            <Link href={`/${locale}/our-story`} className={`${styles.desktopNavLink} typo-small-upper`}>
              About
            </Link>
            <Link href={`/${locale}/services`} className={`${styles.desktopNavLink} typo-small-upper`}>
              {t.nav.services}
            </Link>
            <Link href={`/${locale}/shop`} className={`${styles.desktopNavLink} typo-small-upper`}>
              {t.nav.shop}
            </Link>
          </nav>
        </div>
        <div className={`${styles.brand} typo-caption-upper`}>
          <Link href={`/${locale}`} className={`${styles.brand} typo-caption-upper`}>
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
            <h1 className={`${styles.brandTitle} dob-font typo-display-upper`}>DOB</h1>
            <span className="sr-only">{t.brand}</span>
          </Link>
        </div>
        <div className={styles.mobileRight}>
          <SearchDrawerTrigger className={styles.mobilePlainIcon} ariaLabel="Search">
            <Search />
          </SearchDrawerTrigger>
          <CartDrawerIconTrigger
            className={styles.mobilePlainIcon}
            badgeClassName={`${styles.mobileCartBadge} typo-caption-upper`}
            ariaLabel="Carrello"
          >
            <ShoppingBag />
          </CartDrawerIconTrigger>
        </div>
        <div className={styles.right}>
          <nav className={styles.rightNav} aria-label="Account e carrello">
            <SearchDrawerTrigger className={`${styles.rightNavLink} typo-small-upper`} ariaLabel="Search">
              Search
            </SearchDrawerTrigger>
            <Link href={accountHref} className={`${styles.rightNavLink} typo-small-upper`}>
              {accountHref.includes('/signin') ? 'Sign in' : 'Account'}
            </Link>
            <CartDrawerTrigger className={`${styles.rightNavLink} typo-small-upper`} ariaLabel="Carrello">
              Cart
            </CartDrawerTrigger>
          </nav>
        </div>
      </header>
      <div className={styles.menuOverlay}>
        <div className={styles.menuGrid}>
          <div className={styles.menuLeft}>
            <label className={styles.menuClose} htmlFor="menu-toggle" aria-label="Chiudi menu">
              ×
            </label>
            {menuHighlights.length > 0 ? (
              <div className={styles.menuHighlights}>
                {menuHighlights.map((entry) => (
                  <MenuLink key={`${entry.type}-${entry.href}`} className={styles.menuHighlightCard} href={entry.href}>
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
                      <span className={`${styles.menuHighlightBadge} typo-caption-upper`}>New</span>
                      <p className={`${styles.menuHighlightTitle} typo-caption-upper`}>{entry.title}</p>
                    </div>
                  </MenuLink>
                ))}
              </div>
            ) : null}
            <div className={styles.menuBooking}>
              <p className={`${styles.menuSectionLabel} m-0 typo-caption-upper`}>Get in touch</p>
              <MenuLink
                className={`${styles.menuLink} ${styles.menuLinkIconOnly}`}
                external
                href={whatsappLink}
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
              >
                <span className={`${styles.menuLinkIcon} ${styles.menuLinkIconFacebook}`} aria-hidden="true">
                  <SiFacebook />
                </span>
                <span className="sr-only">Facebook</span>
              </MenuLink>
            </div>
            <p className={`${styles.menuAddress} typo-caption`}>
              Via Giovanni Rasori 9, 20145 Milano, Italia
            </p>
            <MenuLink className={`${styles.menuDirectionsCta} typo-caption-upper`} external href={directionsHref}>
              Get directions
            </MenuLink>
            <div className={styles.menuLinks}>
              <MenuLink className={`${styles.menuLink} typo-small-upper`} href={accountHref}>
                {accountHref.includes('/signin') ? 'Sign in' : 'Account'}
              </MenuLink>
              <MenuLink className={`${styles.menuLink} typo-small-upper`} href={`/${locale}/services`}>
                {t.nav.services}
              </MenuLink>
              <MenuLink className={`${styles.menuLink} typo-small-upper`} href={`/${locale}/shop`}>
                {t.nav.shop}
              </MenuLink>
              <MenuLink className={`${styles.menuLink} typo-small-upper`} href={`/${locale}/our-story`}>
                About
              </MenuLink>
              <MenuLink className={`${styles.menuLink} typo-small-upper`} href={`/${locale}/dob-protocol`}>
                {t.nav.protocol}
              </MenuLink>
              <MenuLink className={`${styles.menuLink} typo-small-upper`} href={`/${locale}/journal`}>
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
    </div>
  )
}
