import type { Locale } from '@/lib/i18n/core'

const normalizePath = (path: string): string => {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

const servicePublicPathAliases: Record<Locale, Array<{ internal: string; public: string }>> = {
  it: [
    { internal: '/privacy', public: '/informativa-privacy' },
    { internal: '/cookie-policy', public: '/informativa-cookie' },
    { internal: '/shipping', public: '/spedizioni' },
    { internal: '/refund', public: '/resi-e-rimborsi' },
    { internal: '/terms', public: '/termini-e-condizioni' },
    { internal: '/faq', public: '/domande-frequenti' },
    { internal: '/contact', public: '/contatti' },
    { internal: '/our-story', public: '/chi-siamo' },
    { internal: '/dob-protocol', public: '/protocollo-dob' },
    { internal: '/journal', public: '/editoriale' },
    { internal: '/programs', public: '/programmi' },
    { internal: '/shop', public: '/negozio' },
    { internal: '/services/service/', public: '/servizi/servizio/' },
    { internal: '/services/treatment/', public: '/servizi/trattamento/' },
    { internal: '/services/goal/', public: '/servizi/obiettivo/' },
    { internal: '/services/area/', public: '/servizi/area/' },
    { internal: '/cart', public: '/carrello' },
    { internal: '/services', public: '/servizi' },
  ],
  en: [
    { internal: '/privacy', public: '/privacy-policy' },
    { internal: '/cookie-policy', public: '/cookie-policy' },
    { internal: '/shipping', public: '/shipping-policy' },
    { internal: '/refund', public: '/refund-policy' },
    { internal: '/terms', public: '/terms-and-conditions' },
    { internal: '/faq', public: '/faq' },
    { internal: '/contact', public: '/contact' },
    { internal: '/our-story', public: '/our-story' },
    { internal: '/dob-protocol', public: '/dob-protocol' },
    { internal: '/journal', public: '/journal' },
    { internal: '/programs', public: '/programs' },
    { internal: '/shop', public: '/shop' },
    { internal: '/cart', public: '/cart' },
    { internal: '/services', public: '/services' },
  ],
  ru: [
    { internal: '/privacy', public: '/politika-konfidentsialnosti' },
    { internal: '/cookie-policy', public: '/politika-cookie' },
    { internal: '/shipping', public: '/dostavka' },
    { internal: '/refund', public: '/vozvrat-i-vozmeshchenie' },
    { internal: '/terms', public: '/usloviya-i-polozheniya' },
    { internal: '/faq', public: '/faq' },
    { internal: '/contact', public: '/kontakty' },
    { internal: '/our-story', public: '/o-nas' },
    { internal: '/dob-protocol', public: '/protokol-dob' },
    { internal: '/journal', public: '/zhurnal' },
    { internal: '/programs', public: '/programmy' },
    { internal: '/shop', public: '/magazin' },
    { internal: '/cart', public: '/korzina' },
    { internal: '/services', public: '/uslugi' },
  ],
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

export const buildLocalizedSeoHref = (locale: Locale, path: string): string =>
  `/${locale}${toPublicSeoPath(locale, path)}`
