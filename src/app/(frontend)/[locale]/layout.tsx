import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import React from 'react'
import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { HeaderThemeObserver } from '@/components/layout/HeaderThemeObserver'
import { Header } from '@/components/layout/Header'
import { PreferencesFooterControl } from '@/components/layout/PreferencesFooterControl'
import { SearchDrawerLazy } from '@/components/layout/SearchDrawerLazy'
import { buildContactLinks } from '@/lib/contact'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { CartDrawerLazy } from '@/components/cart/CartDrawerLazy'
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import {
  parseStoredPreferences,
  resolvePreferencesFromAcceptLanguage,
  USER_PREFS_COOKIE_KEYS,
} from '@/lib/user-preferences'
import styles from './layout.module.css'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const readLocalized = (value: unknown, locale: string) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((entry) => typeof entry === 'string')
    if (typeof first === 'string') return first
  }
  return ''
}

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

  const requestHeaders = await headers()
  const cookieStore = await cookies()
  const detectedPreferences = resolvePreferencesFromAcceptLanguage(
    requestHeaders.get('accept-language'),
  )
  const storedPreferences = parseStoredPreferences({
    locale: cookieStore.get(USER_PREFS_COOKIE_KEYS.locale)?.value,
    country: cookieStore.get(USER_PREFS_COOKIE_KEYS.country)?.value,
    currency: cookieStore.get(USER_PREFS_COOKIE_KEYS.currency)?.value,
  })
  const activePreferences = storedPreferences || detectedPreferences
  const preferencesConfirmed = cookieStore.get(USER_PREFS_COOKIE_KEYS.confirmed)?.value === '1'

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const user = await getAuthenticatedUser()
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    overrideAccess: false,
  })

  const [latestProducts, latestServices] = await Promise.all([
    payload.find({
      collection: 'products',
      locale,
      depth: 1,
      overrideAccess: false,
      limit: 1,
      where: {
        active: { equals: true },
      },
      sort: '-createdAt',
      select: {
        title: true,
        slug: true,
        coverImage: true,
        images: true,
      },
    }),
    payload.find({
      collection: 'services',
      locale,
      depth: 1,
      overrideAccess: false,
      limit: 1,
      where: {
        active: { equals: true },
      },
      sort: '-createdAt',
      select: {
        name: true,
        slug: true,
        gallery: true,
      },
    }),
  ])

  const latestProduct = latestProducts.docs[0]
  const latestService = latestServices.docs[0]
  const latestProductFirstGallery = Array.isArray(latestProduct?.images) ? latestProduct.images[0] : null
  const latestServiceGallery = Array.isArray(latestService?.gallery) ? latestService.gallery[0] : null
  const latestServiceMedia =
    latestServiceGallery && typeof latestServiceGallery === 'object'
      ? (latestServiceGallery as { media?: unknown }).media
      : null

  const menuHighlights = [
    latestProduct
      ? {
          type: 'product' as const,
          title: asString(latestProduct.title),
          href: `/${locale}/shop/${asString(latestProduct.slug)}`,
          image:
            normalizeThumbnailSrc(latestProduct.coverImage) ||
            normalizeThumbnailSrc(latestProductFirstGallery),
        }
      : null,
    latestService
      ? {
          type: 'service' as const,
          title: readLocalized(latestService.name, locale),
          href: `/${locale}/services/service/${asString(latestService.slug)}`,
          image: normalizeThumbnailSrc(latestServiceMedia),
        }
      : null,
  ].filter((entry): entry is { type: 'product' | 'service'; title: string; href: string; image: string | null } =>
    Boolean(entry && entry.title && entry.href),
  )
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
        accountHref={user ? `/${locale}/account` : `/${locale}/signin`}
        t={t}
        whatsappLink={whatsappLink}
        phoneLink={phoneLink}
        instagramLink={instagram || 'https://instagram.com'}
        facebookLink={facebook || 'https://facebook.com'}
        detectedPreferences={detectedPreferences}
        activePreferences={activePreferences}
        preferencesConfirmed={preferencesConfirmed}
        menuHighlights={menuHighlights}
      />
      <div className="pb-[2.5vw]">{children}</div>
      <SearchDrawerLazy locale={locale} />
      <CartDrawerLazy locale={locale} />
      <footer className="mt-auto border-t border-stroke bg-[var(--bg)] text-[color:var(--text-secondary)]">
        <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-[2.25vw] lg:py-12">
          <div className="mb-6 flex justify-start sm:mb-8 sm:justify-center">
            <Link
              href={`/${locale}`}
              className="flex w-full items-center justify-start gap-2 text-left sm:w-auto sm:justify-center sm:gap-4 sm:text-center lg:gap-6"
            >
              <span className={styles.footerBrandMark}>
                <Image
                  src="/brand/logo-black.png"
                  alt=""
                  width={256}
                  height={256}
                  className={`${styles.footerLogoDark} h-14 w-14 sm:h-24 sm:w-24 lg:h-40 lg:w-40`}
                />
                <Image
                  src="/brand/logo-white.png"
                  alt=""
                  width={256}
                  height={256}
                  className={`${styles.footerLogoLight} h-14 w-14 sm:h-24 sm:w-24 lg:h-40 lg:w-40`}
                />
              </span>
              <span className={`${styles.footerTitle} dob-font typo-display-upper font-semibold`}>
                DOB
              </span>
            </Link>
          </div>
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
            <div className="space-y-4 typo-body md:col-span-2 lg:col-span-1">
              <p className="m-0">Unisciti a DOB per una bellezza essenziale, senza sforzo.</p>
              <p className="m-0 text-[color:var(--text-muted)]">Ricevi tips, routine e contenuti esclusivi.</p>
              <form className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-stroke bg-[var(--paper)] sm:flex-row sm:rounded-full">
                <input
                  className="w-full border-0 bg-transparent px-4 py-2.5 typo-small-upper text-[color:var(--text-secondary)] outline-none"
                  placeholder="Email Address"
                />
                <button
                  className="border-t border-stroke px-4 py-2.5 typo-caption-upper sm:border-l sm:border-t-0 sm:py-2"
                  type="button"
                >
                  Iscriviti
                </button>
              </form>
              <p className="m-0 typo-caption normal-case text-[color:var(--text-muted)]">
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
                About
              </Link>
              <Link href={`/${locale}/dob-protocol`} className="block">
                DOB Protocol
              </Link>
              <span className="block text-[color:var(--text-muted)]">Futures (placeholder)</span>
              <span className="block text-[color:var(--text-muted)]">Impact (placeholder)</span>
              <Link href={`/${locale}/journal`} className="block">
                Journal
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
              <span className="block text-[color:var(--text-muted)]">YouTube (placeholder)</span>
              <span className="block text-[color:var(--text-muted)]">TikTok (placeholder)</span>
            </div>
            <div className="space-y-3 typo-small">
              <p className="m-0 typo-caption-upper">Official</p>
              <Link href={`/${locale}/privacy`} className="block">
                Privacy
              </Link>
              <span className="block text-[color:var(--text-muted)]">Terms (placeholder)</span>
              <span className="block text-[color:var(--text-muted)]">Accessibility (placeholder)</span>
              <span className="block text-[color:var(--text-muted)]">FAQ (placeholder)</span>
              <span className="block text-[color:var(--text-muted)]">Contact (placeholder)</span>
              <span className="block text-[color:var(--text-muted)]">Events (placeholder)</span>
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
              <p className="m-0 text-[color:var(--text-muted)]">Preferenze cookie (placeholder)</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-t border-stroke px-4 py-4 typo-caption text-[color:var(--text-muted)] sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-[2.25vw]">
          <p className="m-0">
            © {new Date().getFullYear()} {siteName}
          </p>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <ThemeToggle />
            <PreferencesFooterControl
              currentLocale={locale}
              detected={detectedPreferences}
              active={activePreferences}
              initiallyConfirmed={preferencesConfirmed}
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
