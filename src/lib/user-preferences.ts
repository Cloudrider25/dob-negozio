import type { Locale } from '@/lib/i18n'

export type UserCountry = 'ITA' | 'RU' | 'EN'
export type UserCurrency = 'EUR'

export type UserPreferences = {
  locale: Locale
  country: UserCountry
  currency: UserCurrency
}

export const USER_PREFS_COOKIE_KEYS = {
  confirmed: 'dob_prefs_confirmed',
  country: 'dob_country',
  currency: 'dob_currency',
  locale: 'dob_locale',
} as const

const COUNTRY_BY_LOCALE: Record<Locale, UserCountry> = {
  en: 'EN',
  it: 'ITA',
  ru: 'RU',
}

const CURRENCY_BY_COUNTRY: Record<UserCountry, UserCurrency> = {
  EN: 'EUR',
  ITA: 'EUR',
  RU: 'EUR',
}

export const resolveLocaleFromLanguage = (languageTag?: string | null): Locale => {
  if (!languageTag) return 'en'
  const normalized = languageTag.toLowerCase()

  if (normalized.startsWith('it')) return 'it'
  if (normalized.startsWith('ru')) return 'ru'
  if (normalized.startsWith('en')) return 'en'

  return 'en'
}

export const resolveLocaleFromAcceptLanguage = (acceptLanguage?: string | null): Locale => {
  if (!acceptLanguage) return 'en'
  const first = acceptLanguage.split(',')[0]?.trim() || ''
  return resolveLocaleFromLanguage(first)
}

export const resolvePreferencesFromLocale = (locale: Locale): UserPreferences => {
  const country = COUNTRY_BY_LOCALE[locale]
  return {
    locale,
    country,
    currency: CURRENCY_BY_COUNTRY[country],
  }
}

export const resolvePreferencesFromAcceptLanguage = (
  acceptLanguage?: string | null,
): UserPreferences => {
  return resolvePreferencesFromLocale(resolveLocaleFromAcceptLanguage(acceptLanguage))
}

export const parseStoredPreferences = (value: {
  locale?: string | null
  country?: string | null
  currency?: string | null
}): UserPreferences | null => {
  const locale =
    value.locale === 'it' || value.locale === 'en' || value.locale === 'ru' ? value.locale : null
  const country =
    value.country === 'ITA' || value.country === 'RU' || value.country === 'EN'
      ? value.country
      : null
  const currency = value.currency === 'EUR' ? value.currency : null

  if (!locale || !country || !currency) return null
  return { locale, country, currency }
}

export const formatRegionCurrencyLabel = (prefs: Pick<UserPreferences, 'country' | 'currency'>) => {
  return `${prefs.country} / ${prefs.currency === 'EUR' ? '€' : prefs.currency}`
}
