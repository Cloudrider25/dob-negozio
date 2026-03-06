export type CarouselItem = {
  id?: string | number
  slug?: string
  title: string
  subtitle?: string | null
  price?: string | null
  duration?: string | null
  image: { url: string; alt?: string | null }
  tag?: string | null
  badgeLeft?: string | null
  badgeRight?: string | null
  href?: string
  mobileCtaLabel?: string | null
  ctaAction?: CarouselCtaAction
}

export type ServicesCarouselItem = CarouselItem

export type CarouselCartPayload = {
  id: string
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: string | null
}

export type CarouselCtaAction =
  | {
      mode: 'direct'
      payload: CarouselCartPayload
    }
  | {
      mode: 'options'
      drawerTitle: string
    options: Array<{
      id: string
      label: string
      meta?: string | null
      group?: 'variant' | 'package' | 'default'
      payload: CarouselCartPayload
    }>
  }

export const getCarouselItemKey = (item: CarouselItem, index: number): string => {
  if (typeof item.id === 'string' || typeof item.id === 'number') {
    return String(item.id)
  }
  if (typeof item.slug === 'string' && item.slug.trim().length > 0) {
    return item.slug.trim()
  }
  if (typeof item.href === 'string' && item.href.trim().length > 0) {
    return item.href.trim()
  }
  return `${item.title}-${index}`
}
