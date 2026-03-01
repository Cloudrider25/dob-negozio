import { notFound } from 'next/navigation'
import React from 'react'
import { isLocale, locales } from '@/lib/i18n'
import { FrontendLocaleShell } from '@/components/layout/shell/FrontendLocaleShell'
import { getFrontendLocaleShellData } from '@/components/layout/shell/server/getFrontendLocaleShellData'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const shellData = await getFrontendLocaleShellData(locale)

  return (
    <FrontendLocaleShell {...shellData}>
      {children}
    </FrontendLocaleShell>
  )
}
