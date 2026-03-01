import { CartDrawerLazy } from '@/components/cart'
import { Footer } from '@/components/layout/footer/Footer'
import { HeaderThemeObserver } from '@/components/layout/header/HeaderThemeObserver'
import { Header } from '@/components/layout/header/Header'
import { SearchDrawerLazy } from '@/components/layout/search/SearchDrawerLazy'
import type { FrontendLocaleShellProps } from '@/components/layout/shell/contracts'
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
}: FrontendLocaleShellProps) => {
  return (
    <div className={styles.root} data-locale={locale}>
      <HeaderThemeObserver />
      <Header
        locale={locale}
        accountHref={accountHref}
        t={t}
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
