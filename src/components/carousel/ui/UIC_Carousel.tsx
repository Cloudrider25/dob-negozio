'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation, Swiper, SwiperSlide, type UISwiperInstance } from '@/components/ui/swiper'

import styles from './UIC_Carousel.module.css'
import { UICCarouselCard } from './UIC_CarouselCard'
import { getCarouselItemKey, type CarouselItem } from '../shared/types'
import { ChevronLeft, ChevronRight } from '@/components/ui/icons'
import { CAROUSEL_BREAKPOINTS, CAROUSEL_DEFAULT_LABELS, type CarouselCtaLabel } from '../shared/contracts'
import { normalizeCarouselItems } from '../shared/mappers'

export type UICCarouselProps = {
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
}

export const UICCarousel = ({
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
}: UICCarouselProps) => {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [swiper, setSwiper] = useState<UISwiperInstance | null>(null)
  const safeItems = useMemo(() => normalizeCarouselItems(items), [items])

  useEffect(() => {
    if (!swiper || !prevRef.current || !nextRef.current) return
    const navigation = swiper.params.navigation
    if (!navigation || typeof navigation === 'boolean') return
    navigation.prevEl = prevRef.current
    navigation.nextEl = nextRef.current
    swiper.navigation.init()
    swiper.navigation.update()
  }, [swiper])

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
          spaceBetween={single ? 16 : 48}
          centeredSlides={false}
          loop={false}
          onSwiper={setSwiper}
          navigation
          breakpoints={{
            [CAROUSEL_BREAKPOINTS.mobile]: { slidesPerView: single ? 1 : 1.1, spaceBetween: single ? 16 : 32 },
            [CAROUSEL_BREAKPOINTS.tablet]: { slidesPerView: single ? 1 : 2.1, spaceBetween: single ? 16 : 40 },
            [CAROUSEL_BREAKPOINTS.desktop]: { slidesPerView: single ? 1 : 3, spaceBetween: single ? 16 : 48 },
            [CAROUSEL_BREAKPOINTS.wide]: { slidesPerView: single ? 1 : 3, spaceBetween: single ? 16 : 56 },
          }}
        >
          {safeItems.map((item, index) => (
            <SwiperSlide key={getCarouselItemKey(item, index)} className={styles.slide}>
              <UICCarouselCard
                item={item}
                cardClassName={cardClassName}
                mediaClassName={mediaClassName}
                prioritizeImage={prioritizeFirstSlideImage && index === 0}
                ctaLabel={ctaLabel}
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
