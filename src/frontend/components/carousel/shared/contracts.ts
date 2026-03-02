import type { CarouselItem } from './types'

export const CAROUSEL_BREAKPOINTS = {
  mobile: 0,
  tablet: 700,
  desktop: 1024,
  wide: 1280,
} as const

export const CAROUSEL_DEFAULT_LABELS = {
  aria: 'Carousel',
  empty: 'Nessun elemento disponibile.',
} as const

export type CarouselCtaLabel = string | ((item: CarouselItem) => string)

export const resolveCarouselCtaLabel = (item: CarouselItem, ctaLabel?: CarouselCtaLabel): string => {
  if (typeof ctaLabel === 'function') {
    const computed = ctaLabel(item)
    return typeof computed === 'string' && computed.trim().length > 0 ? computed : item.title
  }

  if (typeof ctaLabel === 'string' && ctaLabel.trim().length > 0) {
    return ctaLabel
  }

  return item.title
}
