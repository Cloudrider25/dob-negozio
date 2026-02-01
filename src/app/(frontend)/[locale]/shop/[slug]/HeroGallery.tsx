'use client'

import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper/types'
import 'swiper/css'

import styles from './product-detail.module.css'

type GalleryItem = {
  media?: { url: string; alt: string }
  mediaType?: string | null
}

type HeroGalleryProps = {
  cover: { url: string; alt: string } | null
  items: GalleryItem[]
}

export function HeroGallery({ cover, items }: HeroGalleryProps) {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const normalizedItems = useMemo(() => {
    const base = items.filter((item) => item.media?.url)
    if (base.length) return base
    return cover ? [{ media: cover, mediaType: 'image' }] : []
  }, [items, cover])

  const slides = normalizedItems

  const playVideoAt = (index: number) => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return
      if (idx === index) {
        const playPromise = video.play()
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => undefined)
        }
      } else {
        video.pause()
      }
    })
  }

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    const handleChange = () => {
      playVideoAt(swiper.realIndex ?? swiper.activeIndex ?? 0)
    }
    swiper.on('slideChange', handleChange)
    handleChange()
    return () => {
      swiper.off('slideChange', handleChange)
    }
  }, [slides.length])

  return (
    <div className={styles.heroMedia}>
      {slides.length ? (
        <Swiper
          className={styles.heroSlider}
          modules={[Autoplay]}
          slidesPerView={1}
          loop={slides.length > 1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          allowTouchMove={false}
          speed={420}
        >
          {slides.map((item, index) => (
            <SwiperSlide key={`${item.media?.url || 'slide'}-${index}`}>
              {item.mediaType === 'video' ? (
                <video
                  className={styles.heroVideo}
                  src={item.media!.url}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  ref={(el) => {
                    videoRefs.current[index] = el
                  }}
                />
              ) : (
                <Image
                  src={item.media!.url}
                  alt={item.media!.alt}
                  fill
                  className={styles.heroImage}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={styles.heroPlaceholder} />
      )}
      <div className={styles.thumbs}>
        {normalizedItems.slice(0, 4).map((item, index) => {
          const isVideo = item.mediaType === 'video'
          const slideIndex = slides.findIndex((slide) => slide.media?.url === item.media?.url)
          return (
            <button
              key={`${item.media?.url || 'placeholder'}-${index}`}
              className={`${styles.thumb} ${isVideo ? styles.thumbVideo : ''}`}
              type="button"
              aria-label={`Preview ${index + 1}`}
              onMouseEnter={() => {
                if (swiperRef.current && slideIndex >= 0) {
                  swiperRef.current.slideToLoop(slideIndex)
                }
              }}
              onFocus={() => {
                if (swiperRef.current && slideIndex >= 0) {
                  swiperRef.current.slideToLoop(slideIndex)
                }
              }}
            >
              {item.media && !isVideo ? (
                <Image src={item.media.url} alt="" fill />
              ) : isVideo ? (
                <span className={styles.playIcon}>▶</span>
              ) : (
                <span className={styles.thumbPlaceholder} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
