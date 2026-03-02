import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'
import { resolveMedia } from '@/lib/frontend/media/resolve'
import { formatServiceDuration, formatServicePrice } from '@/lib/frontend/services/format'
import {
  resolveServiceRelId,
  resolveServiceRelationLabel,
  resolveServiceTreatmentLabel,
} from '@/lib/frontend/services/relations'

type PayloadReader = {
  findByID: (input: {
    collection: 'media'
    id: string
    depth: 0
    overrideAccess: false
  }) => Promise<unknown>
}

type MediaLike = {
  url?: string
  alt?: string
}

export const resolveMediaFromId = async (
  payload: PayloadReader,
  value: unknown,
): Promise<MediaLike | null> => {
  if (!value) return null
  if (typeof value === 'object' && 'url' in value) return value as MediaLike
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return await payload.findByID({
        collection: 'media',
        id: String(value),
        depth: 0,
        overrideAccess: false,
      }) as MediaLike
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
  const entries = gallery
    .map((item) =>
      item && typeof item === 'object'
        ? (item as { media?: unknown; isCover?: boolean; mediaType?: string | null })
        : null,
    )
    .filter(Boolean)
  const resolved = await Promise.all(
    entries.map(async (entry) => {
      if (!entry?.media) return null
      const mediaDoc = await resolveMediaFromId(payload, entry.media)
      const media = mediaDoc ? resolveMedia(mediaDoc, fallbackAlt) : null
      if (!media) return null
      const inferredType =
        entry.mediaType || (media.mimeType && media.mimeType.startsWith('video/') ? 'video' : 'image')
      return {
        media,
        isCover: Boolean(entry.isCover),
        mediaType: inferredType,
      }
    }),
  )
  return resolved.filter(Boolean) as Array<{
    media: { url: string; alt: string; mimeType: string | null }
    isCover: boolean
    mediaType: string | null
  }>
}

export const resolveGalleryCover = async (
  payload: PayloadReader,
  gallery: unknown,
  fallbackAlt: string,
) => {
  const items = await resolveGalleryItems(payload, gallery, fallbackAlt)
  const cover = items.find((item) => item.isCover) ?? items[0]
  return cover ? cover.media : null
}

export const resolveFirstMedia = async (
  payload: PayloadReader,
  candidates: Array<unknown>,
): Promise<MediaLike | null> => {
  for (const candidate of candidates) {
    const resolved = await resolveMediaFromId(payload, candidate)
    if (resolved && typeof resolved.url === 'string') return resolved
  }
  return null
}

export const formatPrice = (locale: string, value?: number | null) => {
  return formatServicePrice(value, {
    locale,
    currency: 'EUR',
    minimumFractionDigits: 0,
    invalidValue: '—',
  })
}

export const formatServiceType = (value?: string | null) => {
  if (value === 'package') return 'Pacchetto'
  if (value === 'single') return 'Singolo'
  return '—'
}

export const formatDuration = (minutes?: number | null) => {
  return formatServiceDuration(minutes, undefined)
}

export const resolveRelationLabel = (value: unknown) => {
  return resolveServiceRelationLabel(value)
}

export const renderRichText = (value: unknown) => {
  if (!value) return null
  if (typeof value === 'string') {
    return { type: 'text', value } as const
  }
  if (typeof value === 'object') {
    try {
      const data = value && typeof value === 'object' && 'root' in value ? (value as SerializedEditorState) : null
      if (!data) return null
      const html = convertLexicalToHTML({ data })
      return html ? ({ type: 'html', value: html } as const) : null
    } catch {
      return null
    }
  }
  return null
}

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const extractText = (node: unknown, acc: string[]) => {
  if (!node || typeof node !== 'object') return
  const record = node as { text?: string; children?: unknown[] }
  if (typeof record.text === 'string') acc.push(record.text)
  if (Array.isArray(record.children)) record.children.forEach((child) => extractText(child, acc))
}

const extractBullets = (node: unknown, acc: string[]) => {
  if (!node || typeof node !== 'object') return
  const record = node as { type?: string; children?: unknown[] }
  if (record.type === 'list' && Array.isArray(record.children)) {
    record.children.forEach((child) => {
      const parts: string[] = []
      extractText(child, parts)
      const text = parts.join(' ').replace(/\s+/g, ' ').trim()
      if (text) acc.push(text)
    })
  }
  if (Array.isArray(record.children)) {
    record.children.forEach((child) => extractBullets(child, acc))
  }
}

const richTextBullets = (value: unknown) => {
  if (!value || typeof value !== 'object') return []
  const root = (value as { root?: unknown }).root
  if (!root) return []
  const bullets: string[] = []
  extractBullets(root, bullets)
  return bullets
}

export const normalizeBullets = (value: unknown) => {
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.replace(/^[\s•*-]+/, '').trim())
      .filter(Boolean)
  }
  return richTextBullets(value)
}

export const resolveTreatmentLabel = (value: unknown) => {
  return resolveServiceTreatmentLabel(value)
}

export const resolveRelId = (value: unknown) => {
  return resolveServiceRelId(value)
}
