import { cookies, headers } from 'next/headers'

import { buildContactLinks } from '@/lib/contact'
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import {
  parseStoredPreferences,
  resolvePreferencesFromAcceptLanguage,
  USER_PREFS_COOKIE_KEYS,
} from '@/lib/user-preferences'
import type { FrontendLocaleShellData } from '@/components/layout/shell/contracts'

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

export const getFrontendLocaleShellData = async (
  locale: Locale,
): Promise<FrontendLocaleShellData> => {
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
  const latestProductFirstGallery = Array.isArray(latestProduct?.images)
    ? latestProduct.images[0]
    : null
  const latestServiceGallery = Array.isArray(latestService?.gallery)
    ? latestService.gallery[0]
    : null
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
  ].filter(
    (
      entry,
    ): entry is { type: 'product' | 'service'; title: string; href: string; image: string | null } =>
      Boolean(entry && entry.title && entry.href),
  )

  const { phoneLink, whatsappLink, phoneDisplay, whatsappDisplay, addressDisplay } =
    buildContactLinks({
      phone: siteSettings?.phone,
      whatsapp: siteSettings?.whatsapp,
      address: siteSettings?.address,
    })

  return {
    locale,
    accountHref: user ? `/${locale}/account` : `/${locale}/signin`,
    t,
    whatsappLink,
    phoneLink,
    detectedPreferences,
    activePreferences,
    preferencesConfirmed,
    menuHighlights,
    siteName: siteSettings?.siteName || 'DOB Milano',
    instagram: siteSettings?.socials?.instagram,
    facebook: siteSettings?.socials?.facebook,
    phoneDisplay,
    whatsappDisplay,
    addressDisplay,
  }
}
