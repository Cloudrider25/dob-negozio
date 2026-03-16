import { getPayload } from 'payload'

import config from '../src/payload/config'

type SupportedLocale = 'it' | 'en' | 'ru'

type ValuesSectionItem = {
  label?: string | null
  title?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

const payload = await getPayload({ config })

const DRY_RUN = process.env.DRY_RUN === 'true'
const locales: SupportedLocale[] = ['it', 'en', 'ru']
const localhostHosts = new Set(['localhost:3000', '127.0.0.1:3000'])

const normalizeHref = (value: string | null | undefined): string | null | undefined => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed) return value
  if (!/^https?:\/\//i.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (localhostHosts.has(url.host)) {
      return `${url.pathname}${url.search}${url.hash}` || '/'
    }
  } catch {
    return trimmed
  }

  return trimmed
}

let processedLocales = 0
let updatedLocales = 0
let updatedItems = 0

for (const locale of locales) {
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    locale,
    overrideAccess: true,
    where: {
      pageKey: {
        equals: 'home',
      },
    },
  })

  const page = result.docs[0]
  if (!page) continue

  processedLocales += 1

  const items = Array.isArray(page.valuesSection?.items)
    ? (page.valuesSection.items as ValuesSectionItem[])
    : []

  if (!items.length) continue

  let localeChanged = false
  const normalizedItems = items.map((item) => {
    const normalizedHref = normalizeHref(item.ctaHref)
    if (normalizedHref !== item.ctaHref) {
      localeChanged = true
      updatedItems += 1
    }

    return {
      ...item,
      ctaHref: normalizedHref,
    }
  })

  if (!localeChanged) continue

  updatedLocales += 1

  payload.logger.info({
    msg: 'Normalizing home page CTA hrefs',
    locale,
    dryRun: DRY_RUN,
  })

  if (DRY_RUN) continue

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale,
    data: {
      valuesSection: {
        ...(page.valuesSection ?? {}),
        items: normalizedItems,
      },
    },
  })
}

payload.logger.info({
  msg: 'Normalize page CTA hrefs completed',
  dryRun: DRY_RUN,
  processedLocales,
  updatedLocales,
  updatedItems,
})
