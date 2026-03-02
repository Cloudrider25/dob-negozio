const TRANSPARENT_THUMBNAIL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizePath = (raw: string): string | null => {
  const value = raw.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value
  if (value.startsWith('api/')) return `/${value}`
  return value
}

export const normalizeThumbnailSrc = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return null
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw) as unknown
        const fromJson = normalizeThumbnailSrc(parsed)
        if (fromJson) return fromJson
      } catch {
        // Ignore malformed JSON.
      }
    }
    return normalizePath(raw)
  }

  if (!isRecord(value)) return null

  const url = value.url
  if (typeof url === 'string') {
    const normalized = normalizePath(url)
    if (normalized) return normalized
  }

  const filename = value.filename
  if (typeof filename === 'string' && filename.trim()) {
    return `/api/media/file/${encodeURIComponent(filename.trim())}`
  }

  return null
}

export const thumbnailOrTransparent = (value: unknown): string =>
  normalizeThumbnailSrc(value) || TRANSPARENT_THUMBNAIL

export const isRemoteThumbnailSrc = (value: unknown): boolean => {
  const normalized = normalizeThumbnailSrc(value)
  return Boolean(normalized && /^https?:\/\//i.test(normalized))
}

