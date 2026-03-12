import { getSeoBaseUrl } from '@/lib/frontend/seo/metadata'
import { toPublicSeoPath } from '@/lib/frontend/seo/routes'
import type { Locale } from '@/lib/i18n/core'

const toAbsoluteUrl = (path: string) => {
  const base = getSeoBaseUrl()
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

const toLocalizedAbsoluteUrl = (locale: Locale, path: string) =>
  toAbsoluteUrl(`/${locale}${toPublicSeoPath(locale, path)}`)

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const extractText = (value: unknown): string => {
  if (typeof value === 'string') return stripHtml(value)
  if (!value || typeof value !== 'object') return ''

  const chunks: string[] = []
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    const record = node as Record<string, unknown>
    if (typeof record.text === 'string') chunks.push(record.text)
    Object.values(record).forEach(visit)
  }
  visit(value)

  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

export const buildLocalBusinessJsonLd = ({
  locale,
  address,
  phone,
}: {
  locale: Locale
  address?: string | null
  phone?: string | null
}) => ({
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'BeautySalon'],
  '@id': toAbsoluteUrl(`/${locale}#organization`),
  name: 'DOB Milano',
  url: toAbsoluteUrl(`/${locale}`),
  image: toAbsoluteUrl('/brand/logo-black.png'),
  areaServed: 'Milano',
  inLanguage: locale,
  address: address
    ? {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressLocality: 'Milano',
        addressCountry: 'IT',
      }
    : undefined,
  telephone: phone || undefined,
})

export const buildBreadcrumbJsonLd = ({
  locale,
  items,
}: {
  locale: Locale
  items: Array<{ name: string; path: string }>
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toLocalizedAbsoluteUrl(locale, item.path),
  })),
})

export const buildServiceJsonLd = ({
  locale,
  name,
  description,
  path,
  imageUrl,
  price,
  currency = 'EUR',
}: {
  locale: Locale
  name: string
  description?: string | null
  path: string
  imageUrl?: string | null
  price?: number | null
  currency?: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description: description ? stripHtml(description) : undefined,
  url: toLocalizedAbsoluteUrl(locale, path),
  areaServed: {
    '@type': 'City',
    name: 'Milano',
  },
  provider: {
    '@type': ['LocalBusiness', 'BeautySalon'],
    name: 'DOB Milano',
    url: toAbsoluteUrl(`/${locale}`),
  },
  image: imageUrl ? toAbsoluteUrl(imageUrl) : undefined,
  offers:
    typeof price === 'number'
      ? {
          '@type': 'Offer',
          price: String(price),
          priceCurrency: currency,
          availability: 'https://schema.org/InStock',
          url: toLocalizedAbsoluteUrl(locale, path),
        }
      : undefined,
})

export const buildFaqJsonLd = ({
  items,
}: {
  items: Array<{ question: string; answer: unknown }>
}) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items
    .map(({ question, answer }) => ({
      '@type': 'Question',
      name: question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractText(answer),
      },
    }))
    .filter((item) => item.name.length > 0 && item.acceptedAnswer.text.length > 0),
})
