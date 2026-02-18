'use client'

import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { Autoplay, Swiper, SwiperSlide, type UISwiperInstance } from '@/components/ui/swiper'

export type HeroGalleryItem = {
  media?: { url: string; alt: string }
  mediaType?: string | null
}

type UIHeroGalleryProps = {
  cover: { url: string; alt: string } | null
  items: HeroGalleryItem[]
  styles: Record<string, string>
}

export function UIHeroGallery({ cover, items, styles }: UIHeroGalleryProps) {
  const swiperRef = useRef<UISwiperInstance | null>(null)
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
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
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
                <Image
                  src={item.media.url}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 20vw, 8vw"
                />
              ) : isVideo ? (
                <span className={`${styles.playIcon} typo-small`}>▶</span>
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
