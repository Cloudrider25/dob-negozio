'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readStoredCookieConsent,
  type CookieConsentPreferences,
} from '@/lib/frontend/preferences/cookie-consent'
import { trackPageView, updateAnalyticsConsent } from '@/lib/frontend/analytics/gtag'

type AnalyticsRuntimeProps = {
  measurementId: string
}

const buildPagePath = (pathname: string, searchParams: Pick<URLSearchParams, 'toString'> | null) => {
  const query = searchParams?.toString() ?? ''
  return query ? `${pathname}?${query}` : pathname
}

export function AnalyticsRuntime({ measurementId }: AnalyticsRuntimeProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [consent, setConsent] = useState<CookieConsentPreferences | null>(null)
  const lastTrackedPathRef = useRef<string | null>(null)

  useEffect(() => {
    const syncConsent = () => {
      setConsent(readStoredCookieConsent().values)
    }

    const handleConsentUpdated = (event: Event) => {
      const next = (event as CustomEvent<CookieConsentPreferences>).detail
      setConsent(next)
    }

    syncConsent()

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdated)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdated)
    }
  }, [])

  useEffect(() => {
    if (!consent) return
    updateAnalyticsConsent(consent)
  }, [consent])

  useEffect(() => {
    if (!consent?.analytics) return
    if (!pathname) return

    const nextPagePath = buildPagePath(pathname, searchParams)
    if (lastTrackedPathRef.current === nextPagePath) return

    trackPageView(measurementId, nextPagePath)
    lastTrackedPathRef.current = nextPagePath
  }, [consent?.analytics, measurementId, pathname, searchParams])

  return null
}
