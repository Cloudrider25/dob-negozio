import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { HeaderThemeObserver } from '@/components/HeaderThemeObserver'
import { Header } from '@/components/Header'
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
        <div className="px-[2.25vw] py-12">
          <div className="mb-8 flex justify-center">
            <Link href={`/${locale}`} className="flex items-center justify-center gap-6 text-center">
              <span className="footer-brand-mark">
                <Image
                  src="/brand/logo-black.png"
                  alt=""
                  width={256}
                  height={256}
                  className="footer-logo-dark h-[16rem] w-[16rem]"
                />
                <Image
                  src="/brand/logo-white.png"
                  alt=""
                  width={256}
                  height={256}
                  className="footer-logo-light h-[16rem] w-[16rem]"
                />
              </span>
              <span className="footer-title dob-font text-[16rem] font-semibold uppercase tracking-[0.28em]">
                DOB
              </span>
            </Link>
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
            <div className="space-y-4 text-[0.95rem]">
              <p className="m-0">Unisciti a DOB per una bellezza essenziale, senza sforzo.</p>
              <p className="m-0 text-[#7a756f]">Ricevi tips, routine e contenuti esclusivi.</p>
              <form className="flex max-w-[360px] overflow-hidden rounded-full border border-stroke bg-white">
                <input
                  className="w-full border-0 bg-transparent px-4 py-2 text-[0.85rem] uppercase tracking-[0.08em] text-[#6b6761] outline-none"
                  placeholder="Email Address"
                />
                <button
                  className="border-l border-stroke px-4 text-[0.75rem] uppercase tracking-[0.12em]"
                  type="button"
                >
                  Iscriviti
                </button>
              </form>
              <p className="m-0 text-[0.75rem] normal-case text-[#7a756f]">
                Iscrivendoti, accetti la nostra{' '}
                <Link className="underline" href={`/${locale}/privacy`}>
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="space-y-3 text-[0.85rem]">
              <p className="m-0 text-[0.75rem] uppercase tracking-[0.12em]">Navigate</p>
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
            <div className="space-y-3 text-[0.85rem]">
              <p className="m-0 text-[0.75rem] uppercase tracking-[0.12em]">Social</p>
              <Link href={instagram || '#'} className="block">
                Instagram{instagram ? '' : ' (placeholder)'}
              </Link>
              <Link href={facebook || '#'} className="block">
                Facebook{facebook ? '' : ' (placeholder)'}
              </Link>
              <span className="block text-[#8c8781]">YouTube (placeholder)</span>
              <span className="block text-[#8c8781]">TikTok (placeholder)</span>
            </div>
            <div className="space-y-3 text-[0.85rem]">
              <p className="m-0 text-[0.75rem] uppercase tracking-[0.12em]">Official</p>
              <Link href={`/${locale}/privacy`} className="block">
                Privacy
              </Link>
              <span className="block text-[#8c8781]">Terms (placeholder)</span>
              <span className="block text-[#8c8781]">Accessibility (placeholder)</span>
              <span className="block text-[#8c8781]">FAQ (placeholder)</span>
              <span className="block text-[#8c8781]">Contact (placeholder)</span>
              <span className="block text-[#8c8781]">Events (placeholder)</span>
            </div>
            <div className="space-y-3 text-[0.85rem]">
              <p className="m-0 text-[0.75rem] uppercase tracking-[0.12em]">Support</p>
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stroke px-[2.25vw] py-4 text-[0.75rem] text-[#7a756f]">
          <p className="m-0">
            © {new Date().getFullYear()} {siteName}
          </p>
          <div className="flex items-center gap-2">
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
