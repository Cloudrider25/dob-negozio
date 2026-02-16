import Image from 'next/image'
import Link from 'next/link'

import { MenuLink } from '@/components/layout/MenuLink'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/cn'
import { CartDrawerTrigger } from '@/components/cart/CartDrawerTrigger'
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
  return (
    <>
      <input className={styles.menuToggle} id="menu-toggle" type="checkbox" />
      <div className={styles.topBar}>prenota una consulenza gratuita</div>
      <header className={styles.header}>
        <div className={styles.menuTrigger}>
          <label className={styles.burger} htmlFor="menu-toggle" aria-label="Apri menu">
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </label>
        </div>
        <div className={styles.brand}>
          <Link href={`/${locale}`} className={styles.brand}>
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
            <h1 className={styles.brandTitle}>DOB</h1>
            <span className="sr-only">{t.brand}</span>
          </Link>
        </div>
        <div className={styles.right}>
          <a className={styles.cta} href={whatsappLink}>
            {t.cta.appointment}
          </a>
          <div className={styles.iconRow} aria-label="Account e carrello">
            <Link
              href={accountHref}
              className={`${styles.iconButton} ${styles.iconButtonGlass}`}
              aria-label="Account"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 12c2.9 0 5-2.3 5-5s-2.1-5-5-5-5 2.3-5 5 2.1 5 5 5Zm0 2c-4 0-8 2.1-8 5v1h16v-1c0-2.9-4-5-8-5Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
            <CartDrawerTrigger
              className={`${styles.iconButton} ${styles.iconButtonGlass}`}
              ariaLabel="Carrello"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 18a2 2 0 1 0 .01 4A2 2 0 0 0 7 18Zm10 0a2 2 0 1 0 .01 4A2 2 0 0 0 17 18Zm-9.3-3h9.7a2 2 0 0 0 2-1.6l1.6-7.2H6.2L5.6 3H2v2h2l3 12Z"
                  fill="currentColor"
                />
              </svg>
            </CartDrawerTrigger>
          </div>
          <ThemeToggle />
          <div className={styles.locale}>
            <button className={styles.localeButton} type="button" aria-haspopup="true">
              {locale.toUpperCase()}
            </button>
            <div className={styles.localeMenu} role="menu">
              {locales.map((item) => (
                <Link
                  key={item}
                  href={`/${item}`}
                  className={cn(styles.localeLink, item === locale && styles.localeLinkActive)}
                >
                  {item.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className={styles.menuOverlay} aria-hidden="true">
        <div className={styles.menuGrid}>
          <div className={styles.menuLeft}>
            <label className={styles.menuClose} htmlFor="menu-toggle" aria-label="Chiudi menu">
              ×
            </label>
            <h2 className={styles.menuTitle}>Menu</h2>
            <div className={styles.menuLinks}>
              <MenuLink className="uppercase tracking-[0.18em]" external href="https://facebook.com">
                Facebook
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" external href="https://instagram.com">
                Instagram
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" href={`/${locale}/our-story`}>
                / {t.nav.story}
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" href={`/${locale}/dob-protocol`}>
                / {t.nav.protocol}
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" href={`/${locale}/journal`}>
                / {t.nav.journal}
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" href={`/${locale}/location`}>
                / {t.nav.location}
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" href={`/${locale}/services`}>
                / {t.nav.services}
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" href={`/${locale}/shop`}>
                / {t.nav.shop}
              </MenuLink>
            </div>
            <div className={styles.menuBooking}>
              <p className="m-0">For booking</p>
              <MenuLink className="uppercase tracking-[0.18em]" external href={whatsappLink}>
                / {t.cta.whatsapp}
              </MenuLink>
              <MenuLink className="uppercase tracking-[0.18em]" external href={phoneLink}>
                / {t.cta.call}
              </MenuLink>
            </div>
            <div className={styles.menuActions}>
              <a className={styles.cta} href={whatsappLink}>
                {t.cta.appointment}
              </a>
              <div className={styles.iconRow} aria-label="Account e carrello">
                <Link
                  href={accountHref}
                  className={`${styles.iconButton} ${styles.iconButtonGlass}`}
                  aria-label="Account"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 12c2.9 0 5-2.3 5-5s-2.1-5-5-5-5 2.3-5 5 2.1 5 5 5Zm0 2c-4 0-8 2.1-8 5v1h16v-1c0-2.9-4-5-8-5Z"
                      fill="currentColor"
                    />
                  </svg>
                </Link>
                <CartDrawerTrigger
                  className={`${styles.iconButton} ${styles.iconButtonGlass}`}
                  ariaLabel="Carrello"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M7 18a2 2 0 1 0 .01 4A2 2 0 0 0 7 18Zm10 0a2 2 0 1 0 .01 4A2 2 0 0 0 17 18Zm-9.3-3h9.7a2 2 0 0 0 2-1.6l1.6-7.2H6.2L5.6 3H2v2h2l3 12Z"
                      fill="currentColor"
                    />
                  </svg>
                </CartDrawerTrigger>
              </div>
              <ThemeToggle />
              <div className={styles.locale}>
                <button className={styles.localeButton} type="button" aria-haspopup="true">
                  {locale.toUpperCase()}
                </button>
                <div className={styles.localeMenu} role="menu">
                  {locales.map((item) => (
                    <Link
                      key={item}
                      href={`/${item}`}
                      className={cn(styles.localeLink, item === locale && styles.localeLinkActive)}
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
