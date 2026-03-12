import type { Locale } from '@/lib/i18n/core'

const normalizePath = (path: string): string => {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

const servicePublicPathAliases: Record<Locale, Array<{ internal: string; public: string }>> = {
  it: [
    { internal: '/services/service/', public: '/servizi/servizio/' },
    { internal: '/services/treatment/', public: '/servizi/trattamento/' },
    { internal: '/services/goal/', public: '/servizi/obiettivo/' },
    { internal: '/services/area/', public: '/servizi/area/' },
    { internal: '/services', public: '/servizi' },
  ],
  en: [],
  ru: [],
}

const byLongestPrefix = (entries: Array<{ internal: string; public: string }>) =>
  [...entries].sort((left, right) => right.internal.length - left.internal.length)

export const toPublicSeoPath = (locale: Locale, path: string): string => {
  const normalized = normalizePath(path)
  const aliases = byLongestPrefix(servicePublicPathAliases[locale] ?? [])

  for (const alias of aliases) {
    if (normalized === alias.internal || normalized.startsWith(alias.internal)) {
      return `${alias.public}${normalized.slice(alias.internal.length)}` || alias.public
    }
  }

  return normalized
}

export const toInternalSeoPath = (locale: Locale, path: string): string => {
  const normalized = normalizePath(path)
  const aliases = [...(servicePublicPathAliases[locale] ?? [])].sort(
    (left, right) => right.public.length - left.public.length,
  )

  for (const alias of aliases) {
    if (normalized === alias.public || normalized.startsWith(alias.public)) {
      return `${alias.internal}${normalized.slice(alias.public.length)}` || alias.internal
    }
  }

  return normalized
}
