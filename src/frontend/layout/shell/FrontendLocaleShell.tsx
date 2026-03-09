import { CartDrawerLazy } from '@/frontend/components/cart/ui/CartDrawerLazy'
import { Footer } from '@/frontend/layout/footer/Footer'
import { HeaderThemeObserver } from '@/frontend/layout/header/HeaderThemeObserver'
import { CookieConsentBanner } from '@/frontend/layout/preferences/CookieConsentBanner'
import { CookiePreferencesDrawer } from '@/frontend/layout/preferences/CookiePreferencesDrawer'
import { Header } from '@/frontend/layout/header/Header'
import { SearchDrawerLazy } from '@/frontend/layout/search/SearchDrawerLazy'
import type { FrontendLocaleShellProps } from '@/frontend/layout/shell/contracts'
import styles from './FrontendLocaleShell.module.css'

export const FrontendLocaleShell = ({
  children,
  locale,
  accountHref,
  t,
  whatsappLink,
  phoneLink,
  detectedPreferences,
  activePreferences,
  preferencesConfirmed,
  menuHighlights,
  siteName,
  instagram,
  facebook,
  phoneDisplay,
  whatsappDisplay,
  addressDisplay,
  cookieBannerContent,
}: FrontendLocaleShellProps) => {
  return (
    <div className={styles.root} data-locale={locale}>
      <HeaderThemeObserver />
      <Header
        locale={locale}
        accountHref={accountHref}
        t={t}
        addressDisplay={addressDisplay}
        whatsappLink={whatsappLink}
        phoneLink={phoneLink}
        instagramLink={instagram || 'https://instagram.com'}
        facebookLink={facebook || 'https://facebook.com'}
        detectedPreferences={detectedPreferences}
        activePreferences={activePreferences}
        preferencesConfirmed={preferencesConfirmed}
        menuHighlights={menuHighlights}
      />
      <div className={styles.content}>{children}</div>
      <CookieConsentBanner locale={locale} content={cookieBannerContent} />
      <CookiePreferencesDrawer locale={locale} content={cookieBannerContent} />
      <SearchDrawerLazy locale={locale} />
      <CartDrawerLazy locale={locale} />
      <Footer
        locale={locale}
        siteName={siteName}
        instagram={instagram}
        facebook={facebook}
        phoneLink={phoneLink}
        phoneDisplay={phoneDisplay}
        whatsappLink={whatsappLink}
        whatsappDisplay={whatsappDisplay}
        addressDisplay={addressDisplay}
        detectedPreferences={detectedPreferences}
        activePreferences={activePreferences}
        preferencesConfirmed={preferencesConfirmed}
      />
    </div>
  )
}
