import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { HeaderThemeObserver } from '@/components/layout/HeaderThemeObserver'
import { PreferencesConfirmModal } from '@/components/layout/PreferencesConfirmModal'
import { isLocale } from '@/lib/i18n'
import {
  resolvePreferencesFromAcceptLanguage,
  USER_PREFS_COOKIE_KEYS,
} from '@/lib/user-preferences'

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
