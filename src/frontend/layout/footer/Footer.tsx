import Image from 'next/image'
import Link from 'next/link'

import { PreferencesFooterControl } from '@/frontend/layout/preferences/PreferencesFooterControl'
import { ThemeToggle } from '@/frontend/components/theme/ThemeToggle'
import type { FooterProps } from '@/frontend/layout/footer/contracts'
import styles from './Footer.module.css'

export const Footer = ({
  locale,
  siteName,
  instagram,
  facebook,
  phoneLink,
  phoneDisplay,
  whatsappLink,
  whatsappDisplay,
  addressDisplay,
  detectedPreferences,
  activePreferences,
  preferencesConfirmed,
}: FooterProps) => {
  const toExternalHref = (raw: string | null | undefined, fallback: string) => {
    const value = raw?.trim()
    if (!value) return fallback
    if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value
    return `https://${value.replace(/^\/+/, '')}`
  }

  const instagramHref = toExternalHref(instagram, 'https://instagram.com')
  const facebookHref = toExternalHref(facebook, 'https://facebook.com')

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link href={`/${locale}`} className={styles.brandLink}>
            <span className={styles.footerBrandMark}>
              <Image
                src="/brand/logo-black.png"
                alt=""
                width={256}
                height={256}
                className={`${styles.footerLogoDark} ${styles.footerLogo}`}
              />
              <Image
                src="/brand/logo-white.png"
                alt=""
                width={256}
                height={256}
                className={`${styles.footerLogoLight} ${styles.footerLogo}`}
              />
            </span>
            <span className={`${styles.footerTitle} dob-font`}>DOB</span>
          </Link>
        </div>

        <section className={styles.newsletterBlock}>
          <p className={`${styles.newsLead} typo-h2-upper`}>Unisciti a DOB per una bellezza essenziale, senza sforzo.</p>
          <p className={`${styles.newsSub} typo-body-lg`}>Ricevi tips, routine e contenuti esclusivi.</p>
          <form className={styles.newsForm}>
            <div className={styles.newsInputWrap}>
              <input
                className={`${styles.newsInput} typo-small-upper`}
                placeholder="Email Address"
              />
            </div>
            <button className={`${styles.newsButton} typo-caption-upper`} type="button">
              Iscriviti
            </button>
          </form>
          <p className={`${styles.newsPolicy} typo-small`}>
            Iscrivendoti, accetti la nostra{' '}
            <Link className={styles.inlineLink} href={`/${locale}/privacy`}>
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className={styles.columnsBlock}>
          <div className={styles.column}>
            <p className={`${styles.columnTitle} typo-caption-upper`}>Navigate</p>
            <Link href={`/${locale}/shop`} className={`${styles.columnLink} typo-small`}>
              Shop
            </Link>
            <Link href={`/${locale}/our-story`} className={`${styles.columnLink} typo-small`}>
              About
            </Link>
            <Link href={`/${locale}/dob-protocol`} className={`${styles.columnLink} typo-small`}>
              DOB Protocol
            </Link>
            <Link href={`/${locale}/services`} className={`${styles.columnLink} typo-small`}>
              Services
            </Link>
            <Link href={`/${locale}/journal`} className={`${styles.columnLink} typo-small`}>
              Journal
            </Link>
          </div>
          <div className={styles.column}>
            <p className={`${styles.columnTitle} typo-caption-upper`}>Social</p>
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.columnLink} typo-small`}
            >
              Instagram
            </a>
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.columnLink} typo-small`}
            >
              Facebook
            </a>
            <span className={`${styles.columnMuted} typo-small`}>YouTube</span>
            <span className={`${styles.columnMuted} typo-small`}>TikTok</span>
          </div>
          <div className={styles.column}>
            <p className={`${styles.columnTitle} typo-caption-upper`}>Official</p>
            <Link href={`/${locale}/privacy`} className={`${styles.columnLink} typo-small`}>
              Privacy
            </Link>
            <span className={`${styles.columnMuted} typo-small`}>Terms (placeholder)</span>
            <span className={`${styles.columnMuted} typo-small`}>Accessibility (placeholder)</span>
            <span className={`${styles.columnMuted} typo-small`}>FAQ (placeholder)</span>
            <span className={`${styles.columnMuted} typo-small`}>Contact (placeholder)</span>
            <span className={`${styles.columnMuted} typo-small`}>Events (placeholder)</span>
          </div>
        </section>

        <section className={styles.supportBlock}>
          <p className={`${styles.supportTitle} typo-caption-upper`}>Support</p>
          <p className={`${styles.supportText} typo-small`}>Siamo qui Lun–Ven 9–17 CET.</p>
          <a className={`${styles.supportLink} typo-small`} href="mailto:info@dobmilano.it">
            info@dobmilano.it
          </a>
          <a className={`${styles.supportLink} typo-small`} href={phoneLink}>
            Tel: {phoneDisplay}
          </a>
          <a className={`${styles.supportLink} typo-small`} href={whatsappLink}>
            WhatsApp: {whatsappDisplay}
          </a>
          <p className={`${styles.supportText} typo-small`}>{addressDisplay}</p>
          <p className={`${styles.supportMuted} typo-small`}>Preferenze cookie (placeholder)</p>
        </section>
      </div>

      <div className={styles.bottomBar}>
        <p className={`${styles.copyright} typo-caption-upper`}>
          © {new Date().getFullYear()} {siteName}
        </p>
        <div className={styles.bottomActions}>
          <ThemeToggle />
          <PreferencesFooterControl
            currentLocale={locale}
            detected={detectedPreferences}
            active={activePreferences}
            initiallyConfirmed={preferencesConfirmed}
          />
        </div>
      </div>
    </footer>
  )
}
