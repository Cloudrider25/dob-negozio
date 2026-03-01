import { describe, expect, it } from 'vitest'

import {
  normalizeHeroMedia,
  normalizeStoryHighlightMedia,
  resolveHeroImageAlt,
  resolveStoryHighlightMedia,
} from '@/components/heroes/shared/media'

describe('heroes media helpers', () => {
  it('uses fallback alt when alt is missing or blank', () => {
    expect(resolveHeroImageAlt({ alt: null, fallback: 'Fallback' })).toBe('Fallback')
    expect(resolveHeroImageAlt({ alt: '   ', fallback: 'Fallback' })).toBe('Fallback')
    expect(resolveHeroImageAlt({ alt: 'Real alt', fallback: 'Fallback' })).toBe('Real alt')
  })

  it('normalizes hero media and drops invalid entries', () => {
    expect(
      normalizeHeroMedia({
        media: { url: '   ', alt: 'X', mimeType: 'image/png' },
        fallbackAlt: 'Fallback title',
      }),
    ).toBeNull()

    expect(
      normalizeHeroMedia({
        media: { url: ' /hero.webp ', alt: ' ', mimeType: ' image/webp ' },
        fallbackAlt: 'Fallback title',
      }),
    ).toEqual({
      url: '/hero.webp',
      alt: 'Fallback title',
      mimeType: 'image/webp',
    })
  })

  it('normalizes story highlight media and resolves deterministic fallbacks', () => {
    expect(normalizeStoryHighlightMedia({ url: '   ', alt: 'X' })).toBeNull()

    expect(normalizeStoryHighlightMedia({ url: ' /story.webp ', alt: ' Story alt ' })).toEqual({
      url: '/story.webp',
      alt: 'Story alt',
    })

    expect(
      resolveStoryHighlightMedia({
        media: { url: '   ', alt: 'Unused' },
        fallbackSrc: '/fallback.webp',
        fallbackAlt: 'Fallback alt',
      }),
    ).toEqual({
      src: '/fallback.webp',
      alt: 'Fallback alt',
    })

    expect(
      resolveStoryHighlightMedia({
        media: { url: ' /story.webp ', alt: '  ' },
        fallbackSrc: '/fallback.webp',
        fallbackAlt: 'Fallback alt',
      }),
    ).toEqual({
      src: '/story.webp',
      alt: 'Fallback alt',
    })
  })
})
