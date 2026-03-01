import Image from 'next/image'
import Link from 'next/link'

import { PreferencesFooterControl } from '@/components/layout/preferences/PreferencesFooterControl'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import type { FooterProps } from '@/components/layout/footer/contracts'
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
  return (
    <footer className="mt-auto border-t border-stroke bg-[var(--bg)] text-[color:var(--text-secondary)]">
      <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-[2.25vw] lg:py-12">
        <div className="mb-6 flex justify-start sm:mb-8 sm:justify-center">
          <Link
            href={`/${locale}`}
            className="flex w-full items-center justify-start gap-2 text-left sm:w-auto sm:justify-center sm:gap-4 sm:text-center lg:gap-6"
          >
            <span className={styles.footerBrandMark}>
              <Image
                src="/brand/logo-black.png"
                alt=""
                width={256}
                height={256}
                className={`${styles.footerLogoDark} h-14 w-14 sm:h-24 sm:w-24 lg:h-40 lg:w-40`}
              />
              <Image
                src="/brand/logo-white.png"
                alt=""
                width={256}
                height={256}
                className={`${styles.footerLogoLight} h-14 w-14 sm:h-24 sm:w-24 lg:h-40 lg:w-40`}
              />
            </span>
            <span className={`${styles.footerTitle} dob-font typo-display-upper font-semibold`}>
              DOB
            </span>
          </Link>
        </div>
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
          <div className="space-y-4 typo-body md:col-span-2 lg:col-span-1">
            <p className="m-0">Unisciti a DOB per una bellezza essenziale, senza sforzo.</p>
            <p className="m-0 text-[color:var(--text-muted)]">Ricevi tips, routine e contenuti esclusivi.</p>
            <form className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-stroke bg-[var(--paper)] sm:flex-row sm:rounded-full">
              <input
                className="w-full border-0 bg-transparent px-4 py-2.5 typo-small-upper text-[color:var(--text-secondary)] outline-none"
                placeholder="Email Address"
              />
              <button
                className="border-t border-stroke px-4 py-2.5 typo-caption-upper sm:border-l sm:border-t-0 sm:py-2"
                type="button"
              >
                Iscriviti
              </button>
            </form>
            <p className="m-0 typo-caption normal-case text-[color:var(--text-muted)]">
              Iscrivendoti, accetti la nostra{' '}
              <Link className="underline" href={`/${locale}/privacy`}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="space-y-3 typo-small">
            <p className="m-0 typo-caption-upper">Navigate</p>
            <Link href={`/${locale}/shop`} className="block">
              Shop
            </Link>
            <Link href={`/${locale}/our-story`} className="block">
              About
            </Link>
            <Link href={`/${locale}/dob-protocol`} className="block">
              DOB Protocol
            </Link>
            <span className="block text-[color:var(--text-muted)]">Futures (placeholder)</span>
            <span className="block text-[color:var(--text-muted)]">Impact (placeholder)</span>
            <Link href={`/${locale}/journal`} className="block">
              Journal
            </Link>
          </div>
          <div className="space-y-3 typo-small">
            <p className="m-0 typo-caption-upper">Social</p>
            <Link href={instagram || '#'} className="block">
              Instagram{instagram ? '' : ' (placeholder)'}
            </Link>
            <Link href={facebook || '#'} className="block">
              Facebook{facebook ? '' : ' (placeholder)'}
            </Link>
            <span className="block text-[color:var(--text-muted)]">YouTube (placeholder)</span>
            <span className="block text-[color:var(--text-muted)]">TikTok (placeholder)</span>
          </div>
          <div className="space-y-3 typo-small">
            <p className="m-0 typo-caption-upper">Official</p>
            <Link href={`/${locale}/privacy`} className="block">
              Privacy
            </Link>
            <span className="block text-[color:var(--text-muted)]">Terms (placeholder)</span>
            <span className="block text-[color:var(--text-muted)]">Accessibility (placeholder)</span>
            <span className="block text-[color:var(--text-muted)]">FAQ (placeholder)</span>
            <span className="block text-[color:var(--text-muted)]">Contact (placeholder)</span>
            <span className="block text-[color:var(--text-muted)]">Events (placeholder)</span>
          </div>
          <div className="space-y-3 typo-small">
            <p className="m-0 typo-caption-upper">Support</p>
            <p className="m-0">Siamo qui Lun–Ven 9–17 CET.</p>
            <a className="block" href="mailto:info@dobmilano.it">
              info@dobmilano.it
            </a>
            <a className="block" href={phoneLink}>
              Tel: {phoneDisplay}
            </a>
            <a className="block" href={whatsappLink}>
              WhatsApp: {whatsappDisplay}
            </a>
            <p className="m-0">{addressDisplay}</p>
            <p className="m-0 text-[color:var(--text-muted)]">Preferenze cookie (placeholder)</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 border-t border-stroke px-4 py-4 typo-caption text-[color:var(--text-muted)] sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-[2.25vw]">
        <p className="m-0">
          © {new Date().getFullYear()} {siteName}
        </p>
        <div className="flex items-center gap-4 self-start sm:self-auto">
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
