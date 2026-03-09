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
export const COOKIE_CONSENT_DRAWER_EVENT = 'dob:open-cookie-preferences'

export const DEFAULT_COOKIE_CONSENT: CookieConsentPreferences = {
  analytics: false,
  personalization: false,
  advertising: false,
}

export const oneYearSeconds = 60 * 60 * 24 * 365

const readCookieValue = (name: string) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const setCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${oneYearSeconds}; SameSite=Lax`
}

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

export const persistCookieConsent = (next: CookieConsentPreferences) => {
  if (typeof window === 'undefined') return

  setCookie(COOKIE_CONSENT_COOKIE_KEYS.confirmed, '1')
  setCookie(COOKIE_CONSENT_COOKIE_KEYS.analytics, serializeCookieConsentFlag(next.analytics))
  setCookie(
    COOKIE_CONSENT_COOKIE_KEYS.personalization,
    serializeCookieConsentFlag(next.personalization),
  )
  setCookie(COOKIE_CONSENT_COOKIE_KEYS.advertising, serializeCookieConsentFlag(next.advertising))

  window.localStorage.setItem(COOKIE_CONSENT_COOKIE_KEYS.confirmed, '1')
  window.localStorage.setItem(
    COOKIE_CONSENT_COOKIE_KEYS.analytics,
    serializeCookieConsentFlag(next.analytics),
  )
  window.localStorage.setItem(
    COOKIE_CONSENT_COOKIE_KEYS.personalization,
    serializeCookieConsentFlag(next.personalization),
  )
  window.localStorage.setItem(
    COOKIE_CONSENT_COOKIE_KEYS.advertising,
    serializeCookieConsentFlag(next.advertising),
  )
}

export const readStoredCookieConsent = (): {
  confirmed: boolean
  values: CookieConsentPreferences
} => {
  if (typeof window === 'undefined') {
    return {
      confirmed: false,
      values: DEFAULT_COOKIE_CONSENT,
    }
  }

  const confirmed =
    readCookieValue(COOKIE_CONSENT_COOKIE_KEYS.confirmed) === '1' ||
    window.localStorage.getItem(COOKIE_CONSENT_COOKIE_KEYS.confirmed) === '1'

  return {
    confirmed,
    values: parseCookieConsent({
      analytics:
        readCookieValue(COOKIE_CONSENT_COOKIE_KEYS.analytics) ||
        window.localStorage.getItem(COOKIE_CONSENT_COOKIE_KEYS.analytics),
      personalization:
        readCookieValue(COOKIE_CONSENT_COOKIE_KEYS.personalization) ||
        window.localStorage.getItem(COOKIE_CONSENT_COOKIE_KEYS.personalization),
      advertising:
        readCookieValue(COOKIE_CONSENT_COOKIE_KEYS.advertising) ||
        window.localStorage.getItem(COOKIE_CONSENT_COOKIE_KEYS.advertising),
    }),
  }
}
