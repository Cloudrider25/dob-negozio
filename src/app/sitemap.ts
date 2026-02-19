import type { MetadataRoute } from 'next'

const locales = ['it', 'en', 'ru'] as const

const localizedPaths = [
  '',
  '/services',
  '/shop',
  '/journal',
  '/our-story',
  '/dob-protocol',
  '/contact',
  '/privacy',
  '/terms',
  '/shipping',
  '/refund',
] as const

const getBaseUrl = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'https://dobmilano.it'

  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  const now = new Date()

  return locales.flatMap((locale) =>
    localizedPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.7,
    })),
  )
}
