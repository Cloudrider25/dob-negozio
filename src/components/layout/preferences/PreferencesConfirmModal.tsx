'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import {
  formatRegionCurrencyLabel,
  resolvePreferencesFromLocale,
  USER_PREFS_COOKIE_KEYS,
  type UserPreferences,
} from '@/lib/user-preferences'
import styles from './PreferencesConfirmModal.module.css'

type PreferencesConfirmModalProps = {
  currentLocale: string
  detected: UserPreferences
  initiallyConfirmed: boolean
  open?: boolean
  onOpenChange?: (next: boolean) => void
  initialPreferences?: UserPreferences
}

const oneYearSeconds = 60 * 60 * 24 * 365

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${oneYearSeconds}; SameSite=Lax`
}

const replaceLeadingLocale = (pathname: string, nextLocale: string) => {
  return pathname.replace(/^\/(it|en|ru)(?=\/|$)/, `/${nextLocale}`)
}

const countryNameByLocale = {
  en: { EN: 'International', ITA: 'Italy', RU: 'Russia' },
  it: { EN: 'Internazionale', ITA: 'Italia', RU: 'Russia' },
  ru: { EN: 'Международный', ITA: 'Италия', RU: 'Россия' },
} as const

const copyByLocale = {
  en: {
    title: 'Location detected automatically',
    line1: (country: string) => `Your location is set to ${country}.`,
    line2:
      'Shipping is now available to your location. Shop in EUR, with free shipping on orders over €70. Duties and VAT are included.',
    continue: 'CONTINUE WITH EUR',
    change: 'Change country / language',
  },
  it: {
    title: 'Impostazioni rilevate automaticamente',
    line1: (country: string) => `La tua posizione è impostata su ${country}.`,
    line2:
      'La spedizione è disponibile per la tua area. Acquista in EUR, con spedizione gratuita sopra €70. Dazi e IVA sono inclusi.',
    continue: 'CONTINUA CON EUR',
    change: 'Cambia Paese / Lingua',
  },
  ru: {
    title: 'Настройки определены автоматически',
    line1: (country: string) => `Ваш регион установлен: ${country}.`,
    line2:
      'Доставка доступна для вашего региона. Покупайте в EUR, бесплатная доставка от €70. Пошлины и НДС включены.',
    continue: 'ПРОДОЛЖИТЬ С EUR',
    change: 'Изменить страну / язык',
  },
} as const

export const PreferencesConfirmModal = ({
  currentLocale,
  detected,
  initiallyConfirmed,
  open,
  onOpenChange,
  initialPreferences,
}: PreferencesConfirmModalProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isControlled = typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = useState(!initiallyConfirmed)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState<'it' | 'en' | 'ru'>(
    (initialPreferences?.locale || detected.locale) as 'it' | 'en' | 'ru',
  )
  const nextPreferences = resolvePreferencesFromLocale(selectedLocale)
  const modalOpen = isControlled ? Boolean(open) : internalOpen
  const uiLocale = nextPreferences.locale
  const copy = copyByLocale[uiLocale]
  const countryName = countryNameByLocale[uiLocale][nextPreferences.country]

  const targetPath = useMemo(() => {
    if (!pathname) return `/${nextPreferences.locale}`
    const nextPath = replaceLeadingLocale(pathname, nextPreferences.locale)
    const queryString = searchParams.toString()
    return queryString ? `${nextPath}?${queryString}` : nextPath
  }, [nextPreferences.locale, pathname, searchParams])

  const closeModal = () => {
    if (isControlled) {
      onOpenChange?.(false)
      return
    }
    setInternalOpen(false)
  }

  if (!modalOpen) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="prefs-title">
      <div className={styles.panel}>
        <h2 id="prefs-title" className={cn(styles.title, 'typo-h4')}>
          {copy.title}
        </h2>
        <p className={cn(styles.text, 'typo-small')}>
          {copy.line1(countryName)}
        </p>
        <p className={cn(styles.text, 'typo-small')}>
          {copy.line2}
        </p>
        <span className={cn(styles.summary, 'typo-caption-upper')}>
          {nextPreferences.locale.toUpperCase()} · {formatRegionCurrencyLabel(nextPreferences)}
        </span>
        {isEditing ? (
          <div className={styles.languagePicker}>
            {(['it', 'en', 'ru'] as const).map((localeOption) => (
              <button
                key={localeOption}
                type="button"
                className={cn(
                  styles.languageOption,
                  'typo-caption-upper',
                  selectedLocale === localeOption && styles.languageOptionActive,
                )}
                onClick={() => setSelectedLocale(localeOption)}
              >
                {localeOption.toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}
        <div className={styles.actions}>
          <Button
            className={cn(styles.confirm, 'typo-caption-upper')}
            kind="main"
            size="sm"
            type="button"
            onClick={() => {
              setCookie(USER_PREFS_COOKIE_KEYS.confirmed, '1')
              setCookie(USER_PREFS_COOKIE_KEYS.locale, nextPreferences.locale)
              setCookie(USER_PREFS_COOKIE_KEYS.country, nextPreferences.country)
              setCookie(USER_PREFS_COOKIE_KEYS.currency, nextPreferences.currency)
              window.localStorage.setItem(USER_PREFS_COOKIE_KEYS.confirmed, '1')
              window.localStorage.setItem(USER_PREFS_COOKIE_KEYS.locale, nextPreferences.locale)
              window.localStorage.setItem(USER_PREFS_COOKIE_KEYS.country, nextPreferences.country)
              window.localStorage.setItem(USER_PREFS_COOKIE_KEYS.currency, nextPreferences.currency)
              setIsEditing(false)
              closeModal()
              if (currentLocale !== nextPreferences.locale) router.replace(targetPath)
            }}
          >
            {copy.continue}
          </Button>
          <button
            className={cn(styles.change, 'typo-caption-upper')}
            type="button"
            onClick={() => {
              setIsEditing((current) => !current)
            }}
          >
            {copy.change}
          </button>
        </div>
      </div>
    </div>
  )
}
