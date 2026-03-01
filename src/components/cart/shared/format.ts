import type { Locale } from '@/lib/i18n'

const localeToIntl: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-US',
  ru: 'ru-RU',
}

export const formatCartPrice = (value: number, locale: Locale, currency?: string): string =>
  new Intl.NumberFormat(localeToIntl[locale], {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
