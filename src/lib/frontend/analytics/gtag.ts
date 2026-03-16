import type { CookieConsentPreferences } from '@/lib/frontend/preferences/cookie-consent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type GtagEventParams = Record<string, unknown>

const callGtag = (...args: unknown[]) => {
  if (typeof window === 'undefined') return
  window.gtag?.(...args)
}

export const updateAnalyticsConsent = (consent: CookieConsentPreferences) => {
  callGtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.advertising ? 'granted' : 'denied',
    ad_user_data: consent.advertising ? 'granted' : 'denied',
    ad_personalization: consent.advertising ? 'granted' : 'denied',
    functionality_storage: consent.personalization ? 'granted' : 'denied',
    personalization_storage: consent.personalization ? 'granted' : 'denied',
    security_storage: 'granted',
  })
}

export const trackPageView = (measurementId: string, pagePath: string) => {
  if (!measurementId) return

  callGtag('event', 'page_view', {
    page_title: typeof document === 'undefined' ? undefined : document.title,
    page_location: typeof window === 'undefined' ? undefined : window.location.href,
    page_path: pagePath,
    send_to: measurementId,
  })
}

export const trackEvent = (
  eventName: string,
  params?: GtagEventParams,
) => {
  if (!eventName) return
  callGtag('event', eventName, params)
}
