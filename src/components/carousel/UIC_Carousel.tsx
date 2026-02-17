'use client'

import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import type { Swiper as SwiperInstance } from 'swiper/types'

import styles from './UIC_Carousel.module.css'
import { UICCarouselCard } from './UIC_CarouselCard'
import type { ServicesCarouselItem } from './types'
import { ChevronLeft, ChevronRight } from '@/components/ui/icons'

export type UICCarouselProps = {
  items: ServicesCarouselItem[]
  single?: boolean
  cardClassName?: string
  mediaClassName?: string
  ariaLabel?: string
  emptyLabel?: string
}

export const UICCarousel = ({
  items,
  single = false,
  cardClassName,
  mediaClassName,
  ariaLabel = 'Carousel',
  emptyLabel = 'Nessun elemento disponibile.',
}: UICCarouselProps) => {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)

  useEffect(() => {
    if (!swiper || !prevRef.current || !nextRef.current) return
    const navigation = swiper.params.navigation
    if (!navigation || typeof navigation === 'boolean') return
    navigation.prevEl = prevRef.current
    navigation.nextEl = nextRef.current
    swiper.navigation.init()
    swiper.navigation.update()
  }, [swiper])

  if (items.length === 0) {
    return (
      <section className={styles.section} aria-label={ariaLabel}>
        <div className={`${styles.empty} typo-body`}>{emptyLabel}</div>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-label={ariaLabel}>
      <div className={styles.wrap}>
        <button ref={prevRef} className={`${styles.nav} ${styles.prev}`} aria-label="Previous">
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
            0: { slidesPerView: single ? 1 : 1.1, spaceBetween: single ? 16 : 32 },
            700: { slidesPerView: single ? 1 : 2.1, spaceBetween: single ? 16 : 40 },
            1024: { slidesPerView: single ? 1 : 3, spaceBetween: single ? 16 : 48 },
          }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.title} className={styles.slide}>
              <UICCarouselCard
                item={item}
                cardClassName={cardClassName}
                mediaClassName={mediaClassName}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <button ref={nextRef} className={`${styles.nav} ${styles.next}`} aria-label="Next">
          <ChevronRight size={42} className={styles.chevron} />
        </button>
      </div>
    </section>
  )
}
