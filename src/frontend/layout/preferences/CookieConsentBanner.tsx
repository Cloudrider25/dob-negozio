'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/frontend/components/ui/primitives/button'
import {
  COOKIE_CONSENT_COOKIE_KEYS,
  COOKIE_CONSENT_EVENT,
  DEFAULT_COOKIE_CONSENT,
  oneYearSeconds,
  parseCookieConsent,
  serializeCookieConsentFlag,
  type CookieConsentPreferences,
} from '@/lib/frontend/preferences/cookie-consent'
import { cn } from '@/lib/shared/ui/cn'
import styles from './CookieConsentBanner.module.css'

type CookieConsentBannerProps = {
  locale: string
}

const copyByLocale = {
  it: {
    body:
      'Questo sito web utilizza tecnologie come i cookie per abilitare le funzionalita essenziali del sito, nonche per analitici, personalizzazione e pubblicita mirata. Puoi accettare le impostazioni predefinite oppure modificare le impostazioni in qualunque momento. Puoi chiudere questo banner per continuare con solo i cookie essenziali.',
    cookiePolicy: "Politica sull'uso dei cookie",
    privacyPolicy: 'Politica sulla riservatezza',
    storagePreferences: 'Preferenze di archiviazione',
    advertising: 'Pubblicita mirata',
    personalization: 'Personalizzazione',
    analytics: 'Analitici',
    save: 'Salva',
    acceptAll: 'Accetta tutto',
    rejectOptional: "Rifiutare cio che non e essenziale",
    close: 'Chiudi banner cookie',
  },
  en: {
    body:
      'This website uses technologies such as cookies to enable essential site functionality, as well as analytics, personalization, and targeted advertising. You can accept the default settings or change them at any time. You can close this banner to continue with essential cookies only.',
    cookiePolicy: 'Cookie policy',
    privacyPolicy: 'Privacy policy',
    storagePreferences: 'Storage preferences',
    advertising: 'Targeted advertising',
    personalization: 'Personalization',
    analytics: 'Analytics',
    save: 'Save',
    acceptAll: 'Accept all',
    rejectOptional: 'Reject non-essential',
    close: 'Close cookie banner',
  },
  ru: {
    body:
      'Этот сайт использует технологии, такие как cookie, для обеспечения основных функций сайта, а также для аналитики, персонализации и таргетированной рекламы. Вы можете принять стандартные настройки или изменить их в любое время. Вы можете закрыть этот баннер и продолжить только с обязательными cookie.',
    cookiePolicy: 'Политика cookie',
    privacyPolicy: 'Политика конфиденциальности',
    storagePreferences: 'Настройки хранения',
    advertising: 'Таргетированная реклама',
    personalization: 'Персонализация',
    analytics: 'Аналитика',
    save: 'Сохранить',
    acceptAll: 'Принять все',
    rejectOptional: 'Отклонить необязательное',
    close: 'Закрыть баннер cookie',
  },
} as const

const readCookieValue = (name: string) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${oneYearSeconds}; SameSite=Lax`
}

const persistCookieConsent = (next: CookieConsentPreferences) => {
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

const readStoredCookieConsent = (): {
  confirmed: boolean
  values: CookieConsentPreferences
} => {
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

export const CookieConsentBanner = ({ locale }: CookieConsentBannerProps) => {
  const copy = copyByLocale[locale as keyof typeof copyByLocale] || copyByLocale.en
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [consent, setConsent] = useState<CookieConsentPreferences>(DEFAULT_COOKIE_CONSENT)

  useEffect(() => {
    const stored = readStoredCookieConsent()
    setConsent(stored.values)
    setIsOpen(!stored.confirmed)
    setIsMounted(true)

    const openBanner = () => {
      const current = readStoredCookieConsent()
      setConsent(current.values)
      setIsOpen(true)
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, openBanner)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, openBanner)
  }, [])

  if (!isMounted || !isOpen) return null

  const saveConsent = (next: CookieConsentPreferences) => {
    setConsent(next)
    persistCookieConsent(next)
    setIsOpen(false)
  }

  const rejectOptional = () => {
    saveConsent(DEFAULT_COOKIE_CONSENT)
  }

  const acceptAll = () => {
    saveConsent({
      analytics: true,
      personalization: true,
      advertising: true,
    })
  }

  return (
    <aside
      className={styles.banner}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
    >
      <button
        type="button"
        className={styles.closeButton}
        aria-label={copy.close}
        onClick={rejectOptional}
      >
        &times;
      </button>

      <h2 id="cookie-consent-title" className={cn(styles.title, 'typo-h4')}>
        Cookie
      </h2>

      <p className={cn(styles.body, 'typo-body')}>{copy.body}</p>

      <div className={styles.linksRow}>
        <Link href={`/${locale}/cookie-policy`} className={cn(styles.link, 'typo-body')}>
          {copy.cookiePolicy}
        </Link>
        <span className={styles.separator}>|</span>
        <Link href={`/${locale}/privacy`} className={cn(styles.link, 'typo-body')}>
          {copy.privacyPolicy}
        </Link>
      </div>

      <p className={cn(styles.sectionTitle, 'typo-body')}>{copy.storagePreferences}</p>

      <div className={styles.toggleGrid}>
        <div className={styles.toggleRow}>
          <button
            type="button"
            role="switch"
            aria-checked={consent.advertising}
            className={cn(styles.toggle, consent.advertising && styles.toggleActive)}
            onClick={() => setConsent((current) => ({ ...current, advertising: !current.advertising }))}
          >
            <span className={styles.toggleThumb} />
          </button>
          <span className={cn(styles.toggleLabel, 'typo-body')}>{copy.advertising}</span>
        </div>

        <div className={styles.toggleRow}>
          <button
            type="button"
            role="switch"
            aria-checked={consent.personalization}
            className={cn(styles.toggle, consent.personalization && styles.toggleActive)}
            onClick={() =>
              setConsent((current) => ({ ...current, personalization: !current.personalization }))
            }
          >
            <span className={styles.toggleThumb} />
          </button>
          <span className={cn(styles.toggleLabel, 'typo-body')}>{copy.personalization}</span>
        </div>

        <div className={styles.toggleRow}>
          <button
            type="button"
            role="switch"
            aria-checked={consent.analytics}
            className={cn(styles.toggle, consent.analytics && styles.toggleActive)}
            onClick={() => setConsent((current) => ({ ...current, analytics: !current.analytics }))}
          >
            <span className={styles.toggleThumb} />
          </button>
          <span className={cn(styles.toggleLabel, 'typo-body')}>{copy.analytics}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          kind="main"
          size="sm"
          className={styles.actionButton}
          onClick={() => saveConsent(consent)}
        >
          {copy.save}
        </Button>
        <Button
          type="button"
          kind="main"
          size="sm"
          className={styles.actionButton}
          onClick={acceptAll}
        >
          {copy.acceptAll}
        </Button>
        <Button
          type="button"
          kind="main"
          size="sm"
          className={styles.actionButton}
          onClick={rejectOptional}
        >
          {copy.rejectOptional}
        </Button>
      </div>
    </aside>
  )
}
