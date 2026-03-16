'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation, Swiper, SwiperSlide, type UISwiperInstance } from '@/frontend/components/ui/primitives/swiper'

import styles from './Carousel.module.css'
import { CarouselCard } from './CarouselCard'
import { getCarouselItemKey, type CarouselItem } from '../shared/types'
import { ChevronLeft, ChevronRight } from '@/frontend/components/ui/primitives/icons'
import { CAROUSEL_BREAKPOINTS, CAROUSEL_DEFAULT_LABELS, type CarouselCtaLabel } from '../shared/contracts'
import { normalizeCarouselItems } from '../shared/mappers'
import { toCarouselAnalyticsItem } from '@/lib/frontend/analytics/ecommerce'
import { trackEvent } from '@/lib/frontend/analytics/gtag'

export type CarouselProps = {
  items: CarouselItem[]
  single?: boolean
  cardClassName?: string
  mediaClassName?: string
  prioritizeFirstSlideImage?: boolean
  ariaLabel?: string
  emptyLabel?: string
  previousLabel?: string
  nextLabel?: string
  ctaLabel?: CarouselCtaLabel
  analyticsListName?: string
}

export const Carousel = ({
  items,
  single = false,
  cardClassName,
  mediaClassName,
  prioritizeFirstSlideImage = false,
  ariaLabel = CAROUSEL_DEFAULT_LABELS.aria,
  emptyLabel = CAROUSEL_DEFAULT_LABELS.empty,
  previousLabel,
  nextLabel,
  ctaLabel,
  analyticsListName,
}: CarouselProps) => {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [swiper, setSwiper] = useState<UISwiperInstance | null>(null)
  const safeItems = useMemo(() => normalizeCarouselItems(items), [items])
  const trackedViewRef = useRef<string | null>(null)
  const resolvedListName = analyticsListName || ariaLabel

  useEffect(() => {
    if (!swiper || !prevRef.current || !nextRef.current) return
    const navigation = swiper.params.navigation
    if (!navigation || typeof navigation === 'boolean') return
    navigation.prevEl = prevRef.current
    navigation.nextEl = nextRef.current
    swiper.navigation.init()
    swiper.navigation.update()
  }, [swiper])

  useEffect(() => {
    if (!safeItems.length) return

    const trackingKey = `${resolvedListName}:${safeItems
      .map((item, index) => getCarouselItemKey(item, index))
      .join('|')}`

    if (trackedViewRef.current === trackingKey) return

    trackEvent('view_item_list', {
      item_list_name: resolvedListName,
      items: safeItems.map((item, index) => toCarouselAnalyticsItem(item, index)),
    })

    trackedViewRef.current = trackingKey
  }, [resolvedListName, safeItems])

  const handleSelectItem = (item: CarouselItem, index: number) => {
    trackEvent('select_item', {
      item_list_name: resolvedListName,
      items: [toCarouselAnalyticsItem(item, index)],
    })
  }

  if (safeItems.length === 0) {
    return (
      <section className={styles.section} aria-label={ariaLabel}>
        <div className={`${styles.empty} typo-body`}>{emptyLabel}</div>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-label={ariaLabel}>
      <div className={styles.wrap}>
        <button
          type="button"
          ref={prevRef}
          className={`${styles.nav} ${styles.prev}`}
          aria-label={previousLabel || ariaLabel}
        >
          <ChevronLeft size={42} className={styles.chevron} />
        </button>
        <Swiper
          className={styles.carousel}
          modules={[Navigation]}
          slidesPerView={single ? 1 : 3}
          spaceBetween={single ? 16 : 24}
          centeredSlides={false}
          loop={false}
          onSwiper={setSwiper}
          navigation
          breakpoints={{
            [CAROUSEL_BREAKPOINTS.mobile]: { slidesPerView: single ? 1 : 1.1, spaceBetween: single ? 16 : 20 },
            [CAROUSEL_BREAKPOINTS.tablet]: { slidesPerView: single ? 1 : 2.1, spaceBetween: single ? 16 : 24 },
            [CAROUSEL_BREAKPOINTS.desktop]: { slidesPerView: single ? 1 : 3, spaceBetween: single ? 16 : 24 },
            [CAROUSEL_BREAKPOINTS.wide]: { slidesPerView: single ? 1 : 3, spaceBetween: single ? 16 : 28 },
          }}
        >
          {safeItems.map((item, index) => (
            <SwiperSlide key={getCarouselItemKey(item, index)} className={styles.slide}>
              <CarouselCard
                item={item}
                cardClassName={cardClassName}
                mediaClassName={mediaClassName}
                prioritizeImage={prioritizeFirstSlideImage && index === 0}
                ctaLabel={ctaLabel}
                onSelectItem={() => handleSelectItem(item, index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          ref={nextRef}
          className={`${styles.nav} ${styles.next}`}
          aria-label={nextLabel || ariaLabel}
        >
          <ChevronRight size={42} className={styles.chevron} />
        </button>
      </div>
    </section>
  )
}
