import type { UserPreferences } from '@/lib/frontend/preferences/user-preferences'

export type FooterProps = {
  locale: string
  siteName: string
  instagram: string | null | undefined
  facebook: string | null | undefined
  phoneLink: string
  phoneDisplay: string
  whatsappLink: string
  whatsappDisplay: string
  addressDisplay: string
  detectedPreferences: UserPreferences
  activePreferences: UserPreferences
  preferencesConfirmed: boolean
}
