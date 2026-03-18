'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/frontend/components/ui/primitives/button'
import {
  COOKIE_CONSENT_DRAWER_EVENT,
  DEFAULT_COOKIE_CONSENT,
  readStoredCookieConsent,
  persistCookieConsent,
  type CookieConsentPreferences,
} from '@/lib/frontend/preferences/cookie-consent'
import type { CookiePolicyBannerContent } from '@/lib/frontend/legal/cookie-policy'
import { buildLocalizedSeoHref } from '@/lib/frontend/seo/routes'
import type { Locale } from '@/lib/i18n/core'
import { cn } from '@/lib/shared/ui/cn'
import styles from './CookieConsentBanner.module.css'

type CookieConsentBannerProps = {
  locale: string
  content: CookiePolicyBannerContent
}

export const CookieConsentBanner = ({ locale, content }: CookieConsentBannerProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [consent, setConsent] = useState<CookieConsentPreferences>(DEFAULT_COOKIE_CONSENT)

  useEffect(() => {
    const stored = readStoredCookieConsent()
    setConsent(stored.values)
    setIsOpen(!stored.confirmed)
    setIsMounted(true)
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
        aria-label={content.closeLabel}
        onClick={rejectOptional}
      >
        &times;
      </button>

      <h2 id="cookie-consent-title" className={cn(styles.title, 'typo-h4')}>
        {content.title}
      </h2>

      <p className={cn(styles.body, 'typo-body')}>{content.body}</p>

      <div className={styles.linksRow}>
        <Link href={buildLocalizedSeoHref(locale as Locale, '/cookie-policy')} className={cn(styles.link, 'typo-body')}>
          {content.cookiePolicyLabel}
        </Link>
        <span className={styles.separator}>|</span>
        <Link href={buildLocalizedSeoHref(locale as Locale, '/privacy')} className={cn(styles.link, 'typo-body')}>
          {content.privacyPolicyLabel}
        </Link>
      </div>

      <button
        type="button"
        className={cn(styles.sectionTitleButton, 'typo-body')}
        onClick={() => {
          window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_DRAWER_EVENT))
          setIsOpen(false)
        }}
      >
        {content.storagePreferencesLabel}
      </button>

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
          <span className={cn(styles.toggleLabel, 'typo-body')}>{content.advertisingLabel}</span>
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
          <span className={cn(styles.toggleLabel, 'typo-body')}>
            {content.personalizationLabel}
          </span>
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
          <span className={cn(styles.toggleLabel, 'typo-body')}>{content.analyticsLabel}</span>
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
          {content.saveLabel}
        </Button>
        <Button
          type="button"
          kind="main"
          size="sm"
          className={styles.actionButton}
          onClick={acceptAll}
        >
          {content.acceptAllLabel}
        </Button>
        <Button
          type="button"
          kind="main"
          size="sm"
          className={styles.actionButton}
          onClick={rejectOptional}
        >
          {content.rejectOptionalLabel}
        </Button>
      </div>
    </aside>
  )
}
