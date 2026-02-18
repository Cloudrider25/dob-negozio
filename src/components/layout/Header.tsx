import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { MenuLink } from '@/components/layout/MenuLink'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/cn'
import { buttonVariants } from '@/lib/ui-variants'
import { CartDrawerTrigger } from '@/components/cart/CartDrawerTrigger'
import { ShoppingBag, User } from '@/components/ui/icons'
import { getButtonBasePalette, getButtonStatePalette } from '@/components/ui/button-theme'
import styles from './Header.module.css'

type HeaderProps = {
  locale: string
  locales: ReadonlyArray<string>
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
}

export const Header = ({
  locale,
  locales,
  accountHref,
  t,
  whatsappLink,
  phoneLink,
}: HeaderProps) => {
  const mainBase = getButtonBasePalette('main')
  const mainState = getButtonStatePalette('main')
  const ctaStyle = {
    '--btn-bg': mainBase.bg,
    '--btn-text': mainBase.text,
    '--btn-border': mainBase.border,
    '--btn-hover-bg': mainState.hoverBg,
    '--btn-hover-text': mainState.hoverText,
    '--btn-hover-border': mainState.hoverBorder,
    '--btn-active-bg': mainState.activeBg,
    '--btn-active-text': mainState.activeText,
    '--btn-active-border': mainState.activeBorder,
    '--btn-focus-ring': mainState.focusRing,
    '--btn-focus-offset': mainState.focusOffset,
  } as CSSProperties

  return (
    <>
      <input className={styles.menuToggle} id="menu-toggle" type="checkbox" />
      <div className={`${styles.topBar} typo-caption-upper`}>prenota una consulenza gratuita</div>
      <header className={styles.header}>
        <div className={styles.menuTrigger}>
          <label className={styles.burger} htmlFor="menu-toggle" aria-label="Apri menu">
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </label>
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
            <h1 className={`${styles.brandTitle} typo-display-upper`}>DOB</h1>
            <span className="sr-only">{t.brand}</span>
          </Link>
        </div>
        <div className={styles.right}>
          <a
            className={cn(buttonVariants({ kind: 'main', size: 'sm' }), styles.cta, 'typo-small-upper')}
            href={whatsappLink}
            rel="noreferrer"
            target="_blank"
            style={ctaStyle}
          >
            {t.cta.appointment}
          </a>
          <div className={styles.iconRow} aria-label="Account e carrello">
            <Link
              href={accountHref}
              className={`${styles.iconButton} ${styles.iconButtonGlass}`}
              aria-label="Account"
            >
              <User />
            </Link>
            <CartDrawerTrigger
              className={`${styles.iconButton} ${styles.iconButtonGlass}`}
              ariaLabel="Carrello"
            >
              <ShoppingBag />
            </CartDrawerTrigger>
          </div>
          <ThemeToggle />
          <div className={styles.locale}>
            <button className={`${styles.localeButton} typo-small-upper`} type="button" aria-haspopup="true">
              {locale.toUpperCase()}
            </button>
            <div className={styles.localeMenu} role="menu">
              {locales.map((item) => (
                <Link
                  key={item}
                  href={`/${item}`}
                  className={cn(styles.localeLink, 'typo-small-upper', item === locale && styles.localeLinkActive)}
                >
                  {item.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className={styles.menuOverlay}>
        <div className={styles.menuGrid}>
          <div className={styles.menuLeft}>
            <label className={styles.menuClose} htmlFor="menu-toggle" aria-label="Chiudi menu">
              ×
            </label>
            <h2 className={`${styles.menuTitle} typo-display-upper`}>Menu</h2>
            <div className={styles.menuLinks}>
              <MenuLink className="typo-small-upper" external href="https://facebook.com">
                Facebook
              </MenuLink>
              <MenuLink className="typo-small-upper" external href="https://instagram.com">
                Instagram
              </MenuLink>
              <MenuLink className="typo-small-upper" href={`/${locale}/our-story`}>
                / {t.nav.story}
              </MenuLink>
              <MenuLink className="typo-small-upper" href={`/${locale}/dob-protocol`}>
                / {t.nav.protocol}
              </MenuLink>
              <MenuLink className="typo-small-upper" href={`/${locale}/journal`}>
                / {t.nav.journal}
              </MenuLink>
              <MenuLink className="typo-small-upper" href={`/${locale}/location`}>
                / {t.nav.location}
              </MenuLink>
              <MenuLink className="typo-small-upper" href={`/${locale}/services`}>
                / {t.nav.services}
              </MenuLink>
              <MenuLink className="typo-small-upper" href={`/${locale}/shop`}>
                / {t.nav.shop}
              </MenuLink>
            </div>
            <div className={styles.menuBooking}>
              <p className="m-0 typo-small-upper">For booking</p>
              <MenuLink className="typo-small-upper" external href={whatsappLink}>
                / {t.cta.whatsapp}
              </MenuLink>
              <MenuLink className="typo-small-upper" external href={phoneLink}>
                / {t.cta.call}
              </MenuLink>
            </div>
            <div className={styles.menuActions}>
              <a
                className={cn(buttonVariants({ kind: 'main', size: 'sm' }), styles.cta, 'typo-small-upper')}
                href={whatsappLink}
                rel="noreferrer"
                target="_blank"
                style={ctaStyle}
              >
                {t.cta.appointment}
              </a>
              <div className={styles.iconRow} aria-label="Account e carrello">
                <Link
                  href={accountHref}
                  className={`${styles.iconButton} ${styles.iconButtonGlass}`}
                  aria-label="Account"
                >
                  <User />
                </Link>
                <CartDrawerTrigger
                  className={`${styles.iconButton} ${styles.iconButtonGlass}`}
                  ariaLabel="Carrello"
                >
                  <ShoppingBag />
                </CartDrawerTrigger>
              </div>
              <ThemeToggle />
              <div className={styles.locale}>
                <button className={`${styles.localeButton} typo-small-upper`} type="button" aria-haspopup="true">
                  {locale.toUpperCase()}
                </button>
                <div className={styles.localeMenu} role="menu">
                  {locales.map((item) => (
                    <Link
                      key={item}
                      href={`/${item}`}
                      className={cn(styles.localeLink, 'typo-small-upper', item === locale && styles.localeLinkActive)}
                    >
                      {item.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
