import type { ShopSearchParams } from './contracts'

export const parseShopSearchParams = async (searchParams?: ShopSearchParams) => {
  const resolved = await searchParams
  const query = resolved?.q?.trim() || ''
  const brand = resolved?.brand?.trim() || ''
  const sort = resolved?.sort?.trim() || 'recent'
  const section = resolved?.section?.trim() || 'shop-all'
  const perPageRaw = resolved?.perPage?.trim() || '12'
  const perPage = Number.parseInt(perPageRaw, 10)
  const pageRaw = resolved?.page?.trim() || '1'
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1)
  const view = resolved?.view?.trim() || 'grid'

  return {
    query,
    brand,
    sort,
    section,
    perPage,
    page,
    view,
  }
}

export const resolveBrandLabel = (brand: unknown, locale: string) => {
  if (!brand || typeof brand === 'number') return undefined
  if (typeof brand === 'string') return brand
  if (typeof brand === 'object') {
    const record = brand as Record<string, unknown>
    const name = record.name
    if (typeof name === 'string') return name
    if (name && typeof name === 'object') {
      const localized = name as Record<string, unknown>
      const preferred = localized[locale]
      if (typeof preferred === 'string') return preferred
      const first = Object.values(localized).find((value) => typeof value === 'string')
      if (typeof first === 'string') return first
    }
  }
  return undefined
}

export const resolveLocalizedText = (value: unknown, locale: string) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((item) => typeof item === 'string')
    if (typeof first === 'string') return first
  }
  return undefined
}

export const getRelationId = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && 'id' in value) {
    const relation = value as { id?: unknown }
    if (typeof relation.id === 'string' || typeof relation.id === 'number') {
      return String(relation.id)
    }
  }
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return undefined
}

export const toIdArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.map((item) => getRelationId(item)).filter((item): item is string => Boolean(item))
}

export const buildMediaUrl = (value: { url?: string | null; filename?: string | null }) => {
  if (typeof value.url === 'string' && value.url.length > 0) return value.url
  if (typeof value.filename === 'string' && value.filename.length > 0) {
    if (process.env.VERCEL === '1') return '/brand/logo-black.png'
    return `/api/media/file/${encodeURIComponent(value.filename)}`
  }
  return null
}
