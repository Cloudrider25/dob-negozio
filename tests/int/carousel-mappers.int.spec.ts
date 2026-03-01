import { describe, expect, it } from 'vitest'

import {
  createCarouselItem,
  getCarouselItemKey,
  normalizeCarouselItems,
  normalizeCarouselItem,
  resolveCarouselCtaLabel,
} from '@/components/carousel'

describe('carousel mappers', () => {
  it('creates a normalized item with fallback image and trimmed strings', () => {
    const item = createCarouselItem({
      id: 'prod-1',
      slug: 'product-one',
      title: '  Product One  ',
      subtitle: '  Desc  ',
      price: '  €10  ',
      duration: ' 30 min ',
      image: null,
      fallbackImage: { url: ' /img/fallback.jpg ', alt: '  Fallback alt  ' },
      href: ' /it/shop/product-one ',
    })

    expect(item).toEqual({
      id: 'prod-1',
      slug: 'product-one',
      title: 'Product One',
      subtitle: 'Desc',
      price: '€10',
      duration: '30 min',
      image: { url: '/img/fallback.jpg', alt: 'Fallback alt' },
      tag: null,
      badgeLeft: null,
      badgeRight: null,
      href: '/it/shop/product-one',
    })
  })

  it('returns null when title or image are missing', () => {
    const missingTitle = createCarouselItem({
      title: '   ',
      image: { url: '/img/a.jpg', alt: null },
    })
    const missingImage = createCarouselItem({
      title: 'Valid title',
      image: null,
      fallbackImage: null,
    })

    expect(missingTitle).toBeNull()
    expect(missingImage).toBeNull()
  })
})

describe('carousel key strategy', () => {
  it('uses id first, then slug, then href, then title-index fallback', () => {
    expect(
      getCarouselItemKey(
        {
          id: 'id-1',
          title: 'Title',
          image: { url: '/img.jpg', alt: 'alt' },
        },
        0,
      ),
    ).toBe('id-1')

    expect(
      getCarouselItemKey(
        {
          slug: 'slug-1',
          title: 'Title',
          image: { url: '/img.jpg', alt: 'alt' },
        },
        1,
      ),
    ).toBe('slug-1')

    expect(
      getCarouselItemKey(
        {
          href: '/it/page',
          title: 'Title',
          image: { url: '/img.jpg', alt: 'alt' },
        },
        2,
      ),
    ).toBe('/it/page')

    expect(
      getCarouselItemKey(
        {
          title: 'Title',
          image: { url: '/img.jpg', alt: 'alt' },
        },
        3,
      ),
    ).toBe('Title-3')
  })
})

describe('carousel runtime normalization', () => {
  it('normalizes partial runtime items and filters invalid entries', () => {
    const normalized = normalizeCarouselItems(
      [
        {
          title: 'Valid item',
          image: { url: '/img/a.jpg', alt: 'A' },
          href: '/it/shop/a',
        },
        {
          title: '',
          image: { url: '/img/b.jpg', alt: 'B' },
        },
        null,
      ],
      { url: '/img/fallback.jpg', alt: 'Fallback' },
    )

    expect(normalized).toHaveLength(1)
    expect(normalized[0]?.title).toBe('Valid item')
    expect(normalized[0]?.image.url).toBe('/img/a.jpg')
  })

  it('uses fallback image when runtime item image is missing', () => {
    const item = normalizeCarouselItem(
      {
        title: 'Fallback image item',
        href: '/it/services/fallback',
      },
      { url: '/img/fallback.jpg', alt: 'Fallback alt' },
    )

    expect(item).not.toBeNull()
    expect(item?.image.url).toBe('/img/fallback.jpg')
    expect(item?.image.alt).toBe('Fallback alt')
  })
})

describe('carousel cta label fallback', () => {
  const baseItem = {
    title: 'Default CTA',
    image: { url: '/img/a.jpg', alt: 'Alt' },
  } as const

  it('falls back to item title when ctaLabel is missing or empty', () => {
    expect(resolveCarouselCtaLabel(baseItem, undefined)).toBe('Default CTA')
    expect(resolveCarouselCtaLabel(baseItem, '')).toBe('Default CTA')
    expect(resolveCarouselCtaLabel(baseItem, '   ')).toBe('Default CTA')
  })

  it('uses static ctaLabel when provided', () => {
    expect(resolveCarouselCtaLabel(baseItem, 'Scopri ora')).toBe('Scopri ora')
  })

  it('uses callback ctaLabel and falls back if callback returns empty', () => {
    expect(resolveCarouselCtaLabel(baseItem, (item) => `Vai a ${item.title}`)).toBe('Vai a Default CTA')
    expect(resolveCarouselCtaLabel(baseItem, () => '')).toBe('Default CTA')
  })
})
