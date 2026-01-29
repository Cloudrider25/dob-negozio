'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import type { Swiper as SwiperInstance } from 'swiper/types'

import styles from './ShopCarousel.module.css'

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
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)

  if (items.length === 0) {
    return (
      <section className={styles.section} aria-label="Services carousel">
        <div className={styles.empty}>Nessun servizio disponibile.</div>
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
    <section className={styles.section} aria-label="Services carousel">
      <div className={styles.wrap}>
        <button ref={prevRef} className={`${styles.nav} ${styles.prev}`} aria-label="Previous">
          ‹
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
            0: { slidesPerView: single ? 1 : 1.1, spaceBetween: 16 },
            700: { slidesPerView: single ? 1 : 2.1, spaceBetween: single ? 16 : 20 },
            1100: { slidesPerView: single ? 1 : 3, spaceBetween: single ? 16 : 24 },
          }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.title} className={styles.slide}>
              <article className={`${styles.card} ${cardClassName ?? ''}`}>
                <div className={`${styles.media} ${mediaClassName ?? ''}`}>
                  {item.badgeLeft && <span className={styles.badgeLeft}>{item.badgeLeft}</span>}
                  {(item.badgeRight || item.tag) && (
                    <span className={styles.badgeRight}>{item.badgeRight || item.tag}</span>
                  )}
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.title}
                    fill
                    sizes="(max-width: 900px) 70vw, 33vw"
                  />
                </div>
                <div className={styles.titleBlock}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{item.title}</h3>
                    <span className={styles.price}>{item.price || ''}</span>
                  </div>
                  <p className={`${styles.meta} ${styles.subtitle}`}>{item.subtitle || ''}</p>
                </div>
                <div className={styles.bottomBlock}>
                  <div className={`${styles.meta} ${styles.metaRow}`}>
                    <span>{item.duration || ''}</span>
                  </div>
                  {item.href ? (
                    <Link className={styles.cta} href={item.href}>
                      Scopri {item.title}
                    </Link>
                  ) : (
                    <button className={styles.cta} type="button">
                      Scopri {item.title}
                    </button>
                  )}
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
