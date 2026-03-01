import type { ReactNode } from 'react'

import type { FooterProps } from '@/components/layout/footer/contracts'
import type { HeaderProps } from '@/components/layout/header/contracts'

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
    children: ReactNode
  }

export type FrontendLocaleShellData = Omit<FrontendLocaleShellProps, 'children'>
