'use client'

import { UICCarousel } from './UIC_Carousel'
import type { ServicesCarouselItem } from './service-carousel/types'

export type { ServicesCarouselItem }

/**
 * @deprecated Use `UICCarousel` directly from `@/components/UIC_Carousel`.
 */
export const ServicesCarousel = ({
  items,
  single = false,
  cardClassName,
  mediaClassName,
}: {
  items: ServicesCarouselItem[]
  single?: boolean
  cardClassName?: string
  mediaClassName?: string
}) => {
  return (
    <UICCarousel
      items={items}
      single={single}
      cardClassName={cardClassName}
      mediaClassName={mediaClassName}
      ariaLabel="Services carousel"
      emptyLabel="Nessun servizio disponibile."
    />
  )
}
