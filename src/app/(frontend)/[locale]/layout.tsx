import { notFound } from 'next/navigation'
import React from 'react'
import { isLocale, locales } from '@/lib/i18n/core'
import { FrontendLocaleShell } from '@/frontend/layout/shell/FrontendLocaleShell'
import { getFrontendLocaleShellData } from '@/frontend/layout/shell/server/getFrontendLocaleShellData'
import { DocumentLanguageSync } from '@/frontend/layout/locale/DocumentLanguageSync'
import { JsonLd } from '@/frontend/components/seo/JsonLd'
import { buildLocalBusinessJsonLd } from '@/lib/frontend/seo/schema'

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
  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    locale,
    address: shellData.addressDisplay,
    phone: shellData.phoneDisplay,
  })

  return (
    <FrontendLocaleShell {...shellData}>
      <JsonLd id={`localbusiness-${locale}`} data={localBusinessJsonLd} />
      <DocumentLanguageSync locale={locale} />
      {children}
    </FrontendLocaleShell>
  )
}
