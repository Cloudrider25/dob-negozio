export type ServicesCarouselItem = {
  title: string
  subtitle?: string | null
  price?: string | null
  duration?: string | null
  image: { url: string; alt?: string | null }
  tag?: string | null
  badgeLeft?: string | null
  badgeRight?: string | null
  href?: string
}
