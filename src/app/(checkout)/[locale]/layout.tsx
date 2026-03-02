import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { HeaderThemeObserver } from '@/frontend/layout/header/HeaderThemeObserver'
import { PreferencesConfirmModal } from '@/frontend/layout/preferences/PreferencesConfirmModal'
import { isLocale } from '@/lib/i18n/core'
import {
  resolvePreferencesFromAcceptLanguage,
  USER_PREFS_COOKIE_KEYS,
} from '@/lib/frontend/preferences/user-preferences'

export default async function CheckoutLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const requestHeaders = await headers()
  const cookieStore = await cookies()
  const detectedPreferences = resolvePreferencesFromAcceptLanguage(
    requestHeaders.get('accept-language'),
  )
  const preferencesConfirmed = cookieStore.get(USER_PREFS_COOKIE_KEYS.confirmed)?.value === '1'

  return (
    <>
      <HeaderThemeObserver />
      <PreferencesConfirmModal
        currentLocale={locale}
        detected={detectedPreferences}
        initiallyConfirmed={preferencesConfirmed}
      />
      {children}
    </>
  )
}
