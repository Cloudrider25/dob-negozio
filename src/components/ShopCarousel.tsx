'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import type { Swiper as SwiperInstance } from 'swiper/types'

import styles from './ShopCarousel.module.css'
import { ServiceCarouselCard } from './ServiceCarouselCard'
import type { ServicesCarouselItem } from './service-carousel/types'

export type ShopCarouselItem = {
  title: string
  subtitle?: string | null
  price?: string | null
  rating?: string | null
  image: { url: string; alt?: string | null }
  tag?: string | null
  href?: string
}

export const ShopCarousel = ({ items }: { items: ShopCarouselItem[] }) => {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)
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

  useEffect(() => {
    if (!swiper || !prevRef.current || !nextRef.current) return
    const navigation = swiper.params.navigation
    if (!navigation || typeof navigation === 'boolean') return
    navigation.prevEl = prevRef.current
    navigation.nextEl = nextRef.current
    swiper.navigation.init()
    swiper.navigation.update()
  }, [swiper])

  if (mappedItems.length === 0) {
    return (
      <section className={styles.section} aria-label="Shop carousel">
        <div className={styles.empty}>Nessun prodotto disponibile.</div>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-label="Shop carousel">
      <div className={styles.wrap}>
        <button ref={prevRef} className={`${styles.nav} ${styles.prev}`} aria-label="Previous">
          ‹
        </button>
        <Swiper
          className={styles.carousel}
          modules={[Navigation]}
          slidesPerView={3}
          spaceBetween={48}
          centeredSlides={false}
          loop={false}
          onSwiper={setSwiper}
          navigation
          breakpoints={{
            0: { slidesPerView: 1.05, spaceBetween: 12 },
            430: { slidesPerView: 1.14, spaceBetween: 14 },
            640: { slidesPerView: 1.36, spaceBetween: 18 },
            900: { slidesPerView: 2.1, spaceBetween: 32 },
            1200: { slidesPerView: 3, spaceBetween: 40 },
          }}
        >
          {mappedItems.map((item) => (
            <SwiperSlide key={item.title} className={styles.slide}>
              <ServiceCarouselCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button ref={nextRef} className={`${styles.nav} ${styles.next}`} aria-label="Next">
          ›
        </button>
      </div>
    </section>
  )
}
