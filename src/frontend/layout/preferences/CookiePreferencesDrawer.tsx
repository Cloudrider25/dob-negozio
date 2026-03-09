'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SideDrawer } from '@/frontend/components/ui/compositions/SideDrawer'
import { Button } from '@/frontend/components/ui/primitives/button'
import {
  COOKIE_CONSENT_DRAWER_EVENT,
  DEFAULT_COOKIE_CONSENT,
  persistCookieConsent,
  readStoredCookieConsent,
  type CookieConsentPreferences,
} from '@/lib/frontend/preferences/cookie-consent'
import type { CookiePolicyBannerContent } from '@/lib/frontend/legal/cookie-policy'
import { cn } from '@/lib/shared/ui/cn'
import styles from './CookiePreferencesDrawer.module.css'

type CookiePreferencesDrawerProps = {
  locale: string
  content: CookiePolicyBannerContent
}

type PreferenceKey = keyof CookieConsentPreferences

const categories = [
  {
    key: 'advertising',
    labelKey: 'advertisingLabel',
    descriptionKey: 'advertisingDescription',
  },
  {
    key: 'personalization',
    labelKey: 'personalizationLabel',
    descriptionKey: 'personalizationDescription',
  },
  {
    key: 'analytics',
    labelKey: 'analyticsLabel',
    descriptionKey: 'analyticsDescription',
  },
] as const satisfies Array<{
  key: PreferenceKey
  labelKey: keyof CookiePolicyBannerContent
  descriptionKey: keyof CookiePolicyBannerContent
}>

export function CookiePreferencesDrawer({ locale, content }: CookiePreferencesDrawerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [consent, setConsent] = useState<CookieConsentPreferences>(DEFAULT_COOKIE_CONSENT)

  useEffect(() => {
    const syncViewport = () => setIsDesktop(window.innerWidth >= 760)
    const syncStoredConsent = () => setConsent(readStoredCookieConsent().values)
    const openDrawer = () => {
      syncStoredConsent()
      setIsOpen(true)
    }

    syncViewport()
    syncStoredConsent()
    setIsMounted(true)

    window.addEventListener('resize', syncViewport)
    window.addEventListener(COOKIE_CONSENT_DRAWER_EVENT, openDrawer)

    return () => {
      window.removeEventListener('resize', syncViewport)
      window.removeEventListener(COOKIE_CONSENT_DRAWER_EVENT, openDrawer)
    }
  }, [])

  if (!isMounted) return null

  const handleSave = () => {
    persistCookieConsent(consent)
    setIsOpen(false)
  }

  return (
    <SideDrawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      ariaLabel={content.storagePreferencesLabel}
      title={<span className={cn(styles.drawerTitle, 'typo-caption-upper')}>{content.storagePreferencesLabel}</span>}
      placement={isDesktop ? 'right' : 'bottom'}
      panelClassName={styles.panel}
    >
      <div className={styles.body}>
        <div className={styles.topBlock}>
          <p className={cn(styles.kicker, 'typo-caption-upper')}>{content.title}</p>
          <p className={cn(styles.intro, 'typo-body')}>{content.body}</p>
          <div className={styles.linksRow}>
            <Link
              href={`/${locale}/cookie-policy`}
              className={cn(styles.link, 'typo-body')}
              onClick={() => setIsOpen(false)}
            >
              {content.cookiePolicyLabel}
            </Link>
            <span className={styles.separator}>|</span>
            <Link
              href={`/${locale}/privacy`}
              className={cn(styles.link, 'typo-body')}
              onClick={() => setIsOpen(false)}
            >
              {content.privacyPolicyLabel}
            </Link>
          </div>
        </div>

        <div className={styles.preferenceList}>
          <section className={styles.preferenceCard}>
            <div className={styles.preferenceHeader}>
                <div className={styles.preferenceCopy}>
                  <h3 className={cn(styles.preferenceTitle, 'typo-body-lg')}>{content.essentialLabel}</h3>
                  <p className={cn(styles.preferenceDescription, 'typo-body')}>
                    {content.essentialDescription}
                  </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked
                aria-label={content.essentialLabel}
                className={cn(styles.toggle, styles.toggleActive, styles.toggleDisabled)}
                disabled
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </section>

          {categories.map((category) => (
            <section key={category.key} className={styles.preferenceCard}>
              <div className={styles.preferenceHeader}>
                <div className={styles.preferenceCopy}>
                  <h3 className={cn(styles.preferenceTitle, 'typo-body-lg')}>
                    {content[category.labelKey]}
                  </h3>
                  <p className={cn(styles.preferenceDescription, 'typo-body')}>
                    {content[category.descriptionKey]}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={consent[category.key]}
                  aria-label={String(content[category.labelKey])}
                  className={cn(styles.toggle, consent[category.key] && styles.toggleActive)}
                  onClick={() =>
                    setConsent((current) => ({
                      ...current,
                      [category.key]: !current[category.key],
                    }))
                  }
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button
            type="button"
            className={cn(styles.secondaryAction, 'typo-small-upper')}
            onClick={() => setConsent(DEFAULT_COOKIE_CONSENT)}
          >
            {content.rejectOptionalLabel}
          </button>
          <button
            type="button"
            className={cn(styles.secondaryAction, 'typo-small-upper')}
            onClick={() =>
              setConsent({
                analytics: true,
                personalization: true,
                advertising: true,
              })
            }
          >
            {content.acceptAllLabel}
          </button>
        </div>
        <Button type="button" kind="main" size="sm" className={styles.saveButton} onClick={handleSave}>
          {content.saveLabel}
        </Button>
      </div>
    </SideDrawer>
  )
}
