import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { HeaderThemeObserver } from '@/components/layout/HeaderThemeObserver'
import { Header } from '@/components/layout/Header'
import { buildContactLinks } from '@/lib/contact'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { CartDrawerLazy } from '@/components/cart/CartDrawerLazy'
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser'

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
  const user = await getAuthenticatedUser()
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
  const instagram = siteSettings?.socials?.instagram
  const facebook = siteSettings?.socials?.facebook
  const siteName = siteSettings?.siteName || 'DOB Milano'

  return (
    <div className="flex min-h-screen flex-col" data-locale={locale}>
      <HeaderThemeObserver />
      <Header
        locale={locale}
        locales={locales}
        accountHref={user ? `/${locale}/account` : `/${locale}/signin`}
        t={t}
        whatsappLink={whatsappLink}
        phoneLink={phoneLink}
      />
      <div className="pb-[2.5vw]">{children}</div>
      <CartDrawerLazy locale={locale} />
      <footer className="mt-auto border-t border-stroke bg-[var(--bg)] text-[#6b6761]">
        <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-[2.25vw] lg:py-12">
          <div className="mb-6 flex justify-start sm:mb-8 sm:justify-center">
            <Link
              href={`/${locale}`}
              className="flex w-full items-center justify-start gap-2 text-left sm:w-auto sm:justify-center sm:gap-4 sm:text-center lg:gap-6"
            >
              <span className="footer-brand-mark">
                <Image
                  src="/brand/logo-black.png"
                  alt=""
                  width={256}
                  height={256}
                  className="footer-logo-dark h-14 w-14 sm:h-24 sm:w-24 lg:h-40 lg:w-40"
                />
                <Image
                  src="/brand/logo-white.png"
                  alt=""
                  width={256}
                  height={256}
                  className="footer-logo-light h-14 w-14 sm:h-24 sm:w-24 lg:h-40 lg:w-40"
                />
              </span>
              <span className="footer-title dob-font typo-display-upper font-semibold">
                DOB
              </span>
            </Link>
          </div>
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
            <div className="space-y-4 typo-body md:col-span-2 lg:col-span-1">
              <p className="m-0">Unisciti a DOB per una bellezza essenziale, senza sforzo.</p>
              <p className="m-0 text-[#7a756f]">Ricevi tips, routine e contenuti esclusivi.</p>
              <form className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-stroke bg-white sm:flex-row sm:rounded-full">
                <input
                  className="w-full border-0 bg-transparent px-4 py-2.5 typo-small-upper text-[#6b6761] outline-none"
                  placeholder="Email Address"
                />
                <button
                  className="border-t border-stroke px-4 py-2.5 typo-caption-upper sm:border-l sm:border-t-0 sm:py-2"
                  type="button"
                >
                  Iscriviti
                </button>
              </form>
              <p className="m-0 typo-caption normal-case text-[#7a756f]">
                Iscrivendoti, accetti la nostra{' '}
                <Link className="underline" href={`/${locale}/privacy`}>
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="space-y-3 typo-small">
              <p className="m-0 typo-caption-upper">Navigate</p>
              <Link href={`/${locale}/shop`} className="block">
                Shop
              </Link>
              <Link href={`/${locale}/our-story`} className="block">
                Our Story
              </Link>
              <Link href={`/${locale}/dob-protocol`} className="block">
                DOB Protocol
              </Link>
              <span className="block text-[#8c8781]">Futures (placeholder)</span>
              <span className="block text-[#8c8781]">Impact (placeholder)</span>
              <Link href={`/${locale}/journal`} className="block">
                Journal
              </Link>
              <Link href={`/${locale}/location`} className="block">
                Dove trovarci
              </Link>
            </div>
            <div className="space-y-3 typo-small">
              <p className="m-0 typo-caption-upper">Social</p>
              <Link href={instagram || '#'} className="block">
                Instagram{instagram ? '' : ' (placeholder)'}
              </Link>
              <Link href={facebook || '#'} className="block">
                Facebook{facebook ? '' : ' (placeholder)'}
              </Link>
              <span className="block text-[#8c8781]">YouTube (placeholder)</span>
              <span className="block text-[#8c8781]">TikTok (placeholder)</span>
            </div>
            <div className="space-y-3 typo-small">
              <p className="m-0 typo-caption-upper">Official</p>
              <Link href={`/${locale}/privacy`} className="block">
                Privacy
              </Link>
              <span className="block text-[#8c8781]">Terms (placeholder)</span>
              <span className="block text-[#8c8781]">Accessibility (placeholder)</span>
              <span className="block text-[#8c8781]">FAQ (placeholder)</span>
              <span className="block text-[#8c8781]">Contact (placeholder)</span>
              <span className="block text-[#8c8781]">Events (placeholder)</span>
            </div>
            <div className="space-y-3 typo-small">
              <p className="m-0 typo-caption-upper">Support</p>
              <p className="m-0">Siamo qui Lun–Ven 9–17 CET.</p>
              <a className="block" href={`mailto:info@dobmilano.it`}>
                info@dobmilano.it
              </a>
              <a className="block" href={phoneLink}>
                Tel: {phoneDisplay}
              </a>
              <a className="block" href={whatsappLink}>
                WhatsApp: {whatsappDisplay}
              </a>
              <p className="m-0">{addressDisplay}</p>
              <p className="m-0 text-[#8c8781]">Preferenze cookie (placeholder)</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-t border-stroke px-4 py-4 typo-caption text-[#7a756f] sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-[2.25vw]">
          <p className="m-0">
            © {new Date().getFullYear()} {siteName}
          </p>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span>Country/Region:</span>
            <span className="rounded-full border border-stroke bg-white px-3 py-1">
              Italy (EUR €)
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
