'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import type { Swiper as SwiperInstance } from 'swiper/types'

import styles from './ShopCarousel.module.css'

export type ShopCarouselItem = {
  title: string
  subtitle?: string | null
  price?: string | null
  rating?: string | null
  image: { url: string; alt?: string | null }
  tag?: string | null
}

export const ShopCarousel = ({ items }: { items: ShopCarouselItem[] }) => {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)

  if (items.length === 0) {
    return (
      <section className={styles.section} aria-label="Shop carousel">
        <div className={styles.empty}>Nessun prodotto disponibile.</div>
      </section>
    )
  }

  useEffect(() => {
    if (!swiper || !prevRef.current || !nextRef.current) return
    const navigation = swiper.params.navigation
    if (!navigation || typeof navigation === 'boolean') return
    navigation.prevEl = prevRef.current
    navigation.nextEl = nextRef.current
    swiper.navigation.init()
    swiper.navigation.update()
  }, [swiper])

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
          spaceBetween={24}
          centeredSlides={false}
          loop={false}
          onSwiper={setSwiper}
          navigation
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 16 },
            700: { slidesPerView: 2.1, spaceBetween: 20 },
            1100: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.title} className={styles.slide}>
              <article className={styles.card}>
                <div className={styles.media}>
                  {item.tag && <span className={styles.tag}>{item.tag}</span>}
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.title}
                    fill
                    sizes="(max-width: 900px) 70vw, 33vw"
                  />
                </div>
                <div>
                  <h3 className={styles.title}>{item.title}</h3>
                  {item.subtitle && <p className={styles.meta}>{item.subtitle}</p>}
                </div>
                <div>
                  <div className={styles.meta}>
                    <span>{item.rating || ''}</span>
                    <span className={styles.price}>{item.price || ''}</span>
                  </div>
                  <button className={styles.cta}>Buy {item.title}</button>
                </div>
              </article>
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
