import type { HeroMedia, StoryHighlightMedia } from '@/components/heroes/shared/contracts'

export const isHeroVideoMime = (mimeType?: string | null) => Boolean(mimeType?.startsWith('video/'))

export const resolveHeroImageAlt = ({
  alt,
  fallback,
}: {
  alt?: string | null
  fallback: string
}) => {
  const normalized = alt?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

export const normalizeHeroMedia = ({
  media,
  fallbackAlt,
}: {
  media?: HeroMedia | null
  fallbackAlt: string
}): HeroMedia | null => {
  const normalizedUrl = media?.url?.trim()
  if (!normalizedUrl) return null

  return {
    url: normalizedUrl,
    alt: resolveHeroImageAlt({ alt: media?.alt, fallback: fallbackAlt }),
    mimeType: media?.mimeType?.trim() || null,
  }
}

export type HeroMediaLayerMode = 'single' | 'dark' | 'light'

export type HeroMediaLayer = {
  mode: HeroMediaLayerMode
  media: HeroMedia
  priority: boolean
}

export const resolveHeroMediaLayers = ({
  darkMedia,
  lightMedia,
  eagerMedia,
}: {
  darkMedia: HeroMedia | null
  lightMedia: HeroMedia | null
  eagerMedia: 'dark' | 'light' | 'both'
}): HeroMediaLayer[] => {
  const darkPriority = eagerMedia === 'dark' || eagerMedia === 'both'
  const lightPriority = eagerMedia === 'light' || eagerMedia === 'both'

  if (darkMedia && !lightMedia) {
    return [{ mode: 'single', media: darkMedia, priority: darkPriority }]
  }

  if (!darkMedia && lightMedia) {
    return [{ mode: 'single', media: lightMedia, priority: lightPriority }]
  }

  const layers: HeroMediaLayer[] = []
  if (darkMedia) layers.push({ mode: 'dark', media: darkMedia, priority: darkPriority })
  if (lightMedia) layers.push({ mode: 'light', media: lightMedia, priority: lightPriority })
  return layers
}

export const normalizeStoryHighlightMedia = (media?: StoryHighlightMedia | null): StoryHighlightMedia | null => {
  const normalizedUrl = media?.url?.trim()
  if (!normalizedUrl) return null

  return {
    url: normalizedUrl,
    alt: media?.alt?.trim() || null,
  }
}

export const resolveStoryHighlightMedia = ({
  media,
  fallbackSrc,
  fallbackAlt,
}: {
  media?: StoryHighlightMedia | null
  fallbackSrc: string
  fallbackAlt: string
}) => {
  const normalizedMedia = normalizeStoryHighlightMedia(media)

  return {
    src: normalizedMedia?.url || fallbackSrc,
    alt: resolveHeroImageAlt({ alt: normalizedMedia?.alt, fallback: fallbackAlt }),
  }
}
