import type { Metadata } from 'next'

import { defaultLocale, locales, type Locale } from '@/lib/i18n/core'
import { toInternalSeoPath, toPublicSeoPath } from '@/lib/frontend/seo/routes'

const MAX_DESCRIPTION_LENGTH = 160

export const getSeoBaseUrl = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'https://dobmilano.com'

  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

const normalizePath = (path: string): string => {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value)

export const buildLocalizedPath = (locale: Locale, path = ''): string => {
  const normalized = toPublicSeoPath(locale, normalizePath(path))
  return `/${locale}${normalized}`
}

const toAbsoluteUrl = (path: string): string =>
  isAbsoluteUrl(path) ? path : `${getSeoBaseUrl()}${normalizePath(path)}`

const toDescription = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) return fallback
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= MAX_DESCRIPTION_LENGTH) return cleaned
  return `${cleaned.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
}

const toOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

const toMediaUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null
  if (!('url' in value)) return null
  const url = (value as { url?: unknown }).url
  return typeof url === 'string' && url.trim().length > 0 ? url : null
}

export const buildSeoMetadata = ({
  locale,
  title,
  description,
  path,
  seo,
}: {
  locale: Locale
  title: string
  description: unknown
  path?: string
  seo?: {
    title?: unknown
    description?: unknown
    canonicalPath?: unknown
    noIndex?: unknown
    image?: unknown
  }
}): Metadata => {
  const resolvedTitle = toOptionalText(seo?.title) ?? title
  const configuredCanonicalPath = toOptionalText(seo?.canonicalPath) ?? path ?? ''
  const canonicalPath = toInternalSeoPath(locale, configuredCanonicalPath)
  const relativePath = buildLocalizedPath(locale, canonicalPath)
  const canonical = toAbsoluteUrl(relativePath)
  const fallbackDescription = 'DOB Milano. Trattamenti e prodotti estetici professionali a Milano.'
  const resolvedDescription = toDescription(seo?.description ?? description, fallbackDescription)
  const imageUrl = toMediaUrl(seo?.image)
  const resolvedImage = imageUrl ? toAbsoluteUrl(imageUrl) : null

  const languages = Object.fromEntries(
    locales.map((currentLocale) => [
      currentLocale,
      toAbsoluteUrl(buildLocalizedPath(currentLocale, canonicalPath)),
    ]),
  ) as Record<Locale, string>

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    ...(seo?.noIndex === true
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': toAbsoluteUrl(buildLocalizedPath(defaultLocale, canonicalPath)),
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: 'DOB Milano',
      locale,
      type: 'website',
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  }
}
