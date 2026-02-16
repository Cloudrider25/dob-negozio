'use client'

import { useMemo } from 'react'

import { UICCarousel } from './UIC_Carousel'
import type { ServicesCarouselItem } from './types'

export type ShopCarouselItem = {
  title: string
  subtitle?: string | null
  price?: string | null
  rating?: string | null
  image: { url: string; alt?: string | null }
  tag?: string | null
  href?: string
}

/**
 * @deprecated Use `UICCarousel` directly from `@/components/carousel/UIC_Carousel`.
 */
export const ShopCarousel = ({ items }: { items: ShopCarouselItem[] }) => {
  const mappedItems = useMemo<ServicesCarouselItem[]>(
    () =>
      items.map((item) => ({
        title: item.title,
        subtitle: item.subtitle ?? null,
        price: item.price ?? null,
        duration: null,
        image: item.image,
        tag: item.tag ?? null,
        badgeLeft: null,
        badgeRight: null,
        href: item.href,
      })),
    [items],
  )

  return (
    <UICCarousel
      items={mappedItems}
      ariaLabel="Shop carousel"
      emptyLabel="Nessun prodotto disponibile."
    />
  )
}
