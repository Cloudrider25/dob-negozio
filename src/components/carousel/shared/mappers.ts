import type { CarouselItem } from './types'

export type CarouselMedia = {
  url: string
  alt?: string | null
}

type CreateCarouselItemArgs = {
  id?: string | number
  slug?: string
  title?: string | null
  subtitle?: string | null
  price?: string | null
  duration?: string | null
  image?: CarouselMedia | null
  fallbackImage?: CarouselMedia | null
  tag?: string | null
  badgeLeft?: string | null
  badgeRight?: string | null
  href?: string
}

const normalizeText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const createCarouselItem = ({
  id,
  slug,
  title,
  subtitle,
  price,
  duration,
  image,
  fallbackImage,
  tag,
  badgeLeft,
  badgeRight,
  href,
}: CreateCarouselItemArgs): CarouselItem | null => {
  const normalizedTitle = normalizeText(title)
  if (!normalizedTitle) return null

  const media = image && normalizeText(image.url) ? image : fallbackImage
  if (!media || !normalizeText(media.url)) return null

  return {
    id,
    slug,
    title: normalizedTitle,
    subtitle: normalizeText(subtitle),
    price: normalizeText(price),
    duration: normalizeText(duration),
    image: {
      url: media.url.trim(),
      alt: normalizeText(media.alt) || normalizedTitle,
    },
    tag: normalizeText(tag),
    badgeLeft: normalizeText(badgeLeft),
    badgeRight: normalizeText(badgeRight),
    href: normalizeText(href) || undefined,
  }
}

export const normalizeCarouselItem = (
  item: Partial<CarouselItem> | null | undefined,
  fallbackImage?: CarouselMedia | null,
): CarouselItem | null => {
  if (!item || typeof item !== 'object') return null

  const normalizedImage =
    item.image && typeof item.image === 'object'
      ? {
          url: String((item.image as { url?: unknown }).url ?? ''),
          alt:
            typeof (item.image as { alt?: unknown }).alt === 'string'
              ? (item.image as { alt?: string }).alt
              : null,
        }
      : null

  return createCarouselItem({
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    duration: item.duration,
    image: normalizedImage,
    fallbackImage: fallbackImage ?? null,
    tag: item.tag,
    badgeLeft: item.badgeLeft,
    badgeRight: item.badgeRight,
    href: item.href,
  })
}

export const normalizeCarouselItems = (
  items: Array<Partial<CarouselItem> | null | undefined>,
  fallbackImage?: CarouselMedia | null,
): CarouselItem[] =>
  items
    .map((item) => normalizeCarouselItem(item, fallbackImage))
    .filter((item): item is CarouselItem => Boolean(item))
