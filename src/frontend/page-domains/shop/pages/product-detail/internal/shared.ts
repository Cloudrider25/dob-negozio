import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'
import { resolveMedia } from '@/lib/frontend/media/resolve'

type PayloadReader = {
  findByID: (input: {
    collection: 'media'
    id: string
    depth: 0
    overrideAccess: false
  }) => Promise<unknown>
}

export const resolveMediaFromId = async (
  payload: PayloadReader,
  value: unknown,
): Promise<unknown | null> => {
  if (!value) return null
  if (typeof value === 'object' && 'url' in value) return value
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return await payload.findByID({
        collection: 'media',
        id: String(value),
        depth: 0,
        overrideAccess: false,
      })
    } catch {
      return null
    }
  }
  return null
}

export const resolveGalleryItems = async (
  payload: PayloadReader,
  gallery: unknown,
  fallbackAlt: string,
) => {
  if (!Array.isArray(gallery)) return []
  const resolved = await Promise.all(
    gallery.map(async (entry) => {
      const mediaDoc = await resolveMediaFromId(payload, entry)
      const media = mediaDoc ? resolveMedia(mediaDoc, fallbackAlt) : null
      if (!media) return null
      return {
        media,
        mediaType: media.mimeType && media.mimeType.startsWith('video/') ? 'video' : 'image',
      }
    }),
  )
  return resolved.filter(Boolean) as Array<{
    media: { url: string; alt: string; mimeType: string | null }
    mediaType: string | null
  }>
}

export const formatPrice = (locale: string, value?: number | null, currency?: string | null) => {
  if (typeof value !== 'number') return ''
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

export const resolveRichTextHtml = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('root' in value)) return null
  try {
    return convertLexicalToHTML({ data: value as SerializedEditorState }) || null
  } catch {
    return null
  }
}

export const resolveText = (value: unknown, locale: string) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const localized = record[locale]
    if (typeof localized === 'string') return localized
    const first = Object.values(record).find((entry) => typeof entry === 'string')
    if (typeof first === 'string') return first
  }
  return null
}

export const normalizeBullets = (value?: string | null) => {
  if (!value) return []
  return value
    .split('\n')
    .map((line) => line.replace(/^[\s•*-]+/, '').trim())
    .filter(Boolean)
}

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const withProduct = (template: string, fallbackName: string, productName?: string | null) =>
  template.replace('{{product}}', productName || fallbackName)

export const resolveProductMedia = (value: unknown, fallbackAlt: string) => {
  const media = resolveMedia(value, fallbackAlt)
  if (!media) return null
  return { url: media.url, alt: media.alt }
}

export const resolveBrandLabel = (brand: unknown, locale: string) => {
  if (!brand || typeof brand === 'number') return null
  const rawName = (brand as { name?: unknown }).name
  if (typeof rawName === 'string') return rawName
  if (rawName && typeof rawName === 'object') {
    const localized = rawName as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((value) => typeof value === 'string')
    if (typeof first === 'string') return first
  }
  return null
}

export const resolveBadgeLabel = (value: unknown, locale: string) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.name === 'string') return record.name
    if (record.name && typeof record.name === 'object') {
      const localized = record.name as Record<string, unknown>
      const preferred = localized[locale]
      if (typeof preferred === 'string') return preferred
      const first = Object.values(localized).find((entry) => typeof entry === 'string')
      if (typeof first === 'string') return first
    }
    if (typeof record.label === 'string') return record.label
  }
  return null
}

export const resolveRelationId = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return String(id)
  }
  return null
}
