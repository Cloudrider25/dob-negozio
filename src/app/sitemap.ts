import type { MetadataRoute } from 'next'
import type { Where } from 'payload'

import { locales, type Locale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

const localizedPaths = [
  '',
  '/services',
  '/services/milano',
  '/services/trattamenti-viso-milano',
  '/services/epilazione-laser-milano',
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

const toPath = (locale: Locale, path: string) => `/${locale}${path}`

const getSlug = (doc: unknown): string | null => {
  if (!doc || typeof doc !== 'object') return null
  const slug = (doc as { slug?: unknown }).slug
  if (typeof slug !== 'string') return null
  const trimmed = slug.trim()
  return trimmed.length > 0 ? trimmed : null
}

const getCollectionSlugs = async ({
  locale,
  collection,
  where,
}: {
  locale: Locale
  collection: 'products' | 'services' | 'treatments' | 'areas' | 'objectives' | 'programs'
  where?: Where
}) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection,
    locale,
    overrideAccess: false,
    depth: 0,
    limit: 1000,
    ...(where ? { where } : {}),
    select: {
      slug: true,
    },
  })

  return result.docs.map(getSlug).filter((value): value is string => Boolean(value))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const now = new Date()
  const urlSet = new Set<string>()

  const addEntry = (relativePath: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) => {
    const url = `${baseUrl}${relativePath}`
    if (urlSet.has(url)) return null
    urlSet.add(url)
    return {
      url,
      lastModified: now,
      changeFrequency,
      priority,
    }
  }

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of localizedPaths) {
      const entry = addEntry(toPath(locale, path), path === '' ? 1 : 0.7, path === '' ? 'daily' : 'weekly')
      if (entry) entries.push(entry)
    }

    let productSlugs: string[] = []
    let serviceSlugs: string[] = []
    let treatmentSlugs: string[] = []
    let areaSlugs: string[] = []
    let goalSlugs: string[] = []
    let programSlugs: string[] = []

    try {
      ;[productSlugs, serviceSlugs, treatmentSlugs, areaSlugs, goalSlugs, programSlugs] =
        await Promise.all([
          getCollectionSlugs({ locale, collection: 'products', where: { active: { equals: true } } }),
          getCollectionSlugs({ locale, collection: 'services', where: { active: { equals: true } } }),
          getCollectionSlugs({ locale, collection: 'treatments', where: { active: { equals: true } } }),
          getCollectionSlugs({ locale, collection: 'areas' }),
          getCollectionSlugs({ locale, collection: 'objectives' }),
          getCollectionSlugs({ locale, collection: 'programs' }),
        ])
    } catch (error) {
      console.warn(`[sitemap] Skipping dynamic entries for locale "${locale}" because DB is not ready.`, error)
    }

    for (const slug of productSlugs) {
      const entry = addEntry(toPath(locale, `/shop/${slug}`), 0.8, 'weekly')
      if (entry) entries.push(entry)
    }

    for (const slug of serviceSlugs) {
      const entry = addEntry(toPath(locale, `/services/service/${slug}`), 0.8, 'weekly')
      if (entry) entries.push(entry)
    }

    for (const slug of treatmentSlugs) {
      const treatmentEntry = addEntry(toPath(locale, `/services/treatment/${slug}`), 0.8, 'weekly')
      if (treatmentEntry) entries.push(treatmentEntry)

      const categoryEntry = addEntry(toPath(locale, `/services/${slug}`), 0.75, 'weekly')
      if (categoryEntry) entries.push(categoryEntry)
    }

    for (const slug of areaSlugs) {
      const entry = addEntry(toPath(locale, `/services/area/${slug}`), 0.75, 'weekly')
      if (entry) entries.push(entry)
    }

    for (const slug of goalSlugs) {
      const entry = addEntry(toPath(locale, `/services/goal/${slug}`), 0.75, 'weekly')
      if (entry) entries.push(entry)
    }

    for (const slug of programSlugs) {
      const entry = addEntry(toPath(locale, `/programs/${slug}`), 0.75, 'weekly')
      if (entry) entries.push(entry)
    }
  }

  return entries
}
