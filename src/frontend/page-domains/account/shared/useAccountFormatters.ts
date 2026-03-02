'use client'

import { useCallback, useMemo, useRef } from 'react'

const resolveIntlLocale = (locale: string) => {
  if (locale === 'it') return 'it-IT'
  if (locale === 'ru') return 'ru-RU'
  return 'en-US'
}

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value))

export function useAccountFormatters(locale: string) {
  const intlLocale = useMemo(() => resolveIntlLocale(locale), [locale])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [intlLocale],
  )

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [intlLocale],
  )

  const currencyFormattersRef = useRef<Map<string, Intl.NumberFormat>>(new Map())

  const formatDate = useCallback(
    (value: string | Date | null | undefined, fallback = '—') => {
      if (!value) return fallback
      const date = toDate(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return dateFormatter.format(date)
    },
    [dateFormatter],
  )

  const formatDateTime = useCallback(
    (value: string | Date | null | undefined, fallback = '—') => {
      if (!value) return fallback
      const date = toDate(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return dateTimeFormatter.format(date)
    },
    [dateTimeFormatter],
  )

  const formatMoney = useCallback(
    (value: number, currency: string) => {
      const safeCurrency = currency || 'EUR'
      const cacheKey = `${intlLocale}:${safeCurrency}`
      let formatter = currencyFormattersRef.current.get(cacheKey)
      if (!formatter) {
        formatter = new Intl.NumberFormat(intlLocale, {
          style: 'currency',
          currency: safeCurrency,
          minimumFractionDigits: 2,
        })
        currencyFormattersRef.current.set(cacheKey, formatter)
      }
      return formatter.format(value)
    },
    [intlLocale],
  )

  return {
    formatDate,
    formatDateTime,
    formatMoney,
  }
}
