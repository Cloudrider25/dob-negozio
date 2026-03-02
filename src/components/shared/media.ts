export type ResolvedMedia = {
  url: string
  alt: string
  mimeType: string | null
}

type GalleryEntry = { media?: unknown; isCover?: boolean } | null

export const resolveMedia = (value: unknown, fallbackAlt = ''): ResolvedMedia | null => {
  if (!value || typeof value !== 'object' || !('url' in value)) return null
  const typed = value as { url?: string | null; alt?: string | null; mimeType?: string | null }
  if (!typed.url) return null
  return {
    url: typed.url,
    alt: typed.alt || fallbackAlt,
    mimeType: typed.mimeType || null,
  }
}

const normalizeGalleryEntries = (gallery: unknown): GalleryEntry[] => {
  if (!Array.isArray(gallery)) return []
  return gallery
    .map((item) =>
      item && typeof item === 'object' ? (item as { media?: unknown; isCover?: boolean }) : null,
    )
    .filter(Boolean)
}

export const resolveGalleryCover = (gallery: unknown, fallbackAlt: string): ResolvedMedia | null => {
  const entries = normalizeGalleryEntries(gallery)
  const cover = entries.find((entry) => entry?.isCover) ?? entries[0]
  return cover?.media ? resolveMedia(cover.media, fallbackAlt) : null
}

export const resolveGallerySecondary = (
  gallery: unknown,
  fallbackAlt: string,
): ResolvedMedia | null => {
  const entries = normalizeGalleryEntries(gallery)
  const secondary = entries.find((entry) => !entry?.isCover && entry?.media) ?? entries[1] ?? entries[0]
  return secondary?.media ? resolveMedia(secondary.media, fallbackAlt) : null
}
