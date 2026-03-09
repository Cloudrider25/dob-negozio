export type CookieConsentPreferences = {
  analytics: boolean
  personalization: boolean
  advertising: boolean
}

export const COOKIE_CONSENT_COOKIE_KEYS = {
  confirmed: 'dob_cookie_consent_confirmed',
  analytics: 'dob_cookie_consent_analytics',
  personalization: 'dob_cookie_consent_personalization',
  advertising: 'dob_cookie_consent_advertising',
} as const

export const COOKIE_CONSENT_EVENT = 'dob:open-cookie-consent'

export const DEFAULT_COOKIE_CONSENT: CookieConsentPreferences = {
  analytics: false,
  personalization: false,
  advertising: false,
}

export const oneYearSeconds = 60 * 60 * 24 * 365

export const parseBooleanFlag = (value?: string | null): boolean | null => {
  if (value === '1') return true
  if (value === '0') return false
  return null
}

export const parseCookieConsent = (value: {
  analytics?: string | null
  personalization?: string | null
  advertising?: string | null
}): CookieConsentPreferences => {
  return {
    analytics: parseBooleanFlag(value.analytics) ?? DEFAULT_COOKIE_CONSENT.analytics,
    personalization:
      parseBooleanFlag(value.personalization) ?? DEFAULT_COOKIE_CONSENT.personalization,
    advertising: parseBooleanFlag(value.advertising) ?? DEFAULT_COOKIE_CONSENT.advertising,
  }
}

export const serializeCookieConsentFlag = (value: boolean) => (value ? '1' : '0')
