import type { UserPreferences } from '@/lib/user-preferences'

export type MenuHighlight = {
  type: 'product' | 'service'
  title: string
  href: string
  image: string | null
}

export type HeaderTranslations = {
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

export type HeaderProps = {
  locale: string
  accountHref: string
  t: HeaderTranslations
  whatsappLink: string
  phoneLink: string
  instagramLink: string
  facebookLink: string
  detectedPreferences: UserPreferences
  activePreferences: UserPreferences
  preferencesConfirmed: boolean
  menuHighlights: MenuHighlight[]
}
