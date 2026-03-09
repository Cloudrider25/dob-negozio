import type { ReactNode } from 'react'

import type { FooterProps } from '@/frontend/layout/footer/contracts'
import type { HeaderProps } from '@/frontend/layout/header/contracts'
import type { CookiePolicyBannerContent } from '@/lib/frontend/legal/cookie-policy'

export type FrontendLocaleShellProps = Pick<
  HeaderProps,
  | 'locale'
  | 'accountHref'
  | 't'
  | 'whatsappLink'
  | 'phoneLink'
  | 'detectedPreferences'
  | 'activePreferences'
  | 'preferencesConfirmed'
  | 'menuHighlights'
> &
  Pick<FooterProps, 'siteName' | 'instagram' | 'facebook' | 'phoneDisplay' | 'whatsappDisplay' | 'addressDisplay'> & {
    cookieBannerContent: CookiePolicyBannerContent
    children: ReactNode
  }

export type FrontendLocaleShellData = Omit<FrontendLocaleShellProps, 'children'>
