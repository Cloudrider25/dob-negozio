import { notFound } from 'next/navigation'
import React from 'react'
import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { HeaderThemeObserver } from '@/components/HeaderThemeObserver'
import { Header } from '@/components/Header'
import { buildContactLinks } from '@/lib/contact'
import { getPayloadClient } from '@/lib/getPayloadClient'

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

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    overrideAccess: false,
  })
  const { phoneLink, whatsappLink, phoneDisplay, whatsappDisplay, addressDisplay } =
    buildContactLinks({
      phone: siteSettings?.phone,
      whatsapp: siteSettings?.whatsapp,
      address: siteSettings?.address,
    })

  return (
    <div className="flex min-h-screen flex-col" data-locale={locale}>
      <HeaderThemeObserver />
      <Header
        locale={locale}
        locales={locales}
        t={t}
        whatsappLink={whatsappLink}
        phoneLink={phoneLink}
      />
      <div className="px-[5vw] pb-16">{children}</div>
      <footer className="mt-auto grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 border-t border-stroke px-[5vw] py-10 text-[0.8rem] uppercase tracking-[0.12em] text-text-secondary">
        <div>
          <p className="m-0">{t.brand}</p>
          <p className="m-0">{addressDisplay}</p>
        </div>
        <div>
          <p className="m-0">WhatsApp: {whatsappDisplay}</p>
          <p className="m-0">Telefono: {phoneDisplay}</p>
        </div>
        <div>
          <p className="m-0">© {new Date().getFullYear()} DOB Milano</p>
          <p className="m-0">All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
