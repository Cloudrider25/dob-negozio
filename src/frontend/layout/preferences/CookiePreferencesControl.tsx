'use client'

import { COOKIE_CONSENT_EVENT } from '@/lib/frontend/preferences/cookie-consent'

type CookiePreferencesControlProps = {
  locale: string
  className?: string
}

const labelByLocale = {
  it: 'Preferenze cookie',
  en: 'Cookie preferences',
  ru: 'Настройки cookie',
} as const

export const CookiePreferencesControl = ({
  locale,
  className,
}: CookiePreferencesControlProps) => {
  const label = labelByLocale[locale as keyof typeof labelByLocale] || labelByLocale.en

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT))
      }}
    >
      {label}
    </button>
  )
}

