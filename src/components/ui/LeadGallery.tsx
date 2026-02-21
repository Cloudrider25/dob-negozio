'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Autoplay, Swiper, SwiperSlide, type UISwiperInstance } from '@/components/ui/swiper'
import { cn } from '@/lib/cn'
import styles from './LeadGallery.module.css'

export type LeadGalleryItem = {
  media?: { url: string; alt: string }
  mediaType?: string | null
}

type UILeadGalleryProps = {
  cover: { url: string; alt: string } | null
  items: LeadGalleryItem[]
  mobilePeek?: boolean
  showProgress?: boolean
  classNames?: {
    media?: string
    slider?: string
    image?: string
    video?: string
    placeholder?: string
    thumbs?: string
    thumb?: string
    thumbVideo?: string
    playIcon?: string
    thumbPlaceholder?: string
    progressLine?: string
    progressStep?: string
    progressStepActive?: string
  }
}

export function UILeadGallery({
  cover,
  items,
  mobilePeek = false,
  showProgress = false,
  classNames,
}: UILeadGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const swiperRef = useRef<UISwiperInstance | null>(null)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const normalizedItems = useMemo(() => {
    const base = items.filter((item) => item.media?.url)
    if (base.length) return base
    return cover ? [{ media: cover, mediaType: 'image' }] : []
  }, [items, cover])

  const slides = normalizedItems
  const hasProgressLine = showProgress
  const shouldLoop = slides.length > 1 && !isMobileViewport

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
      const index = swiper.realIndex ?? swiper.activeIndex ?? 0
      setActiveIndex(index)
      playVideoAt(index)
    }
    swiper.on('slideChange', handleChange)
    handleChange()
    return () => {
      swiper.off('slideChange', handleChange)
    }
  }, [slides.length])

  useEffect(() => {
    setActiveIndex(0)
  }, [slides.length])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)')
    const sync = () => setIsMobileViewport(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const update = () => {
      const parentWidth = Math.round(
        (node.parentElement?.getBoundingClientRect().width || node.getBoundingClientRect().width),
      )
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : parentWidth
      const next = Math.round(Math.min(parentWidth, viewportWidth))
      if (next >= 200 && next <= 4000) setContainerWidth(next)
    }
    update()
    const observer = new ResizeObserver(() => update())
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={cn(styles.media, classNames?.media)}>
      {slides.length ? (
        <Swiper
          className={cn(styles.slider, classNames?.slider)}
          modules={[Autoplay]}
          width={isMobileViewport ? (containerWidth || undefined) : undefined}
          slidesPerView={mobilePeek ? 1.08 : 1}
          spaceBetween={mobilePeek ? 10 : 0}
          loop={shouldLoop}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            requestAnimationFrame(() => swiper.update())
          }}
          observer
          observeParents
          resizeObserver
          allowTouchMove
          simulateTouch
          touchStartPreventDefault={false}
          threshold={6}
          breakpoints={{
            1025: {
              slidesPerView: 1,
              spaceBetween: 0,
            },
          }}
          speed={420}
        >
          {slides.map((item, index) => (
            <SwiperSlide key={`${item.media?.url || 'slide'}-${index}`}>
              {item.mediaType === 'video' ? (
                <video
                  className={cn(styles.video, classNames?.video)}
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
                  className={cn(styles.image, classNames?.image)}
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
        <div className={cn(styles.placeholder, classNames?.placeholder)} />
      )}
      <div className={cn(styles.thumbs, classNames?.thumbs)}>
        {normalizedItems.slice(0, 4).map((item, index) => {
          const isVideo = item.mediaType === 'video'
          const slideIndex = slides.findIndex((slide) => slide.media?.url === item.media?.url)
          return (
            <button
              key={`${item.media?.url || 'placeholder'}-${index}`}
              className={cn(styles.thumb, classNames?.thumb, isVideo ? styles.thumbVideo : '', isVideo ? classNames?.thumbVideo : '')}
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
                <span className={cn(styles.playIcon, classNames?.playIcon, 'typo-small')}>▶</span>
              ) : (
                <span className={cn(styles.thumbPlaceholder, classNames?.thumbPlaceholder)} />
              )}
            </button>
          )
        })}
      </div>
      {hasProgressLine ? (
        <div className={cn(styles.progressLine, classNames?.progressLine)} aria-hidden="true">
          {slides.map((item, index) => (
            <span
              key={`${item.media?.url || 'progress'}-${index}`}
              className={cn(
                styles.progressStep,
                classNames?.progressStep,
                index === activeIndex ? styles.progressStepActive : '',
                index === activeIndex ? classNames?.progressStepActive : '',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
