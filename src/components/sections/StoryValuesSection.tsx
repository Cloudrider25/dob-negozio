'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper/types'
import 'swiper/css'

import styles from './StoryValuesSection.module.css'

export type StoryValuesItem = {
  label?: string | null
  title?: string | null
  description?: string | null
  media?: { url: string; alt?: string | null } | null
}

type StoryValuesSectionProps = {
  items: StoryValuesItem[]
}

export const StoryValuesSection = ({ items }: StoryValuesSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperInstance | null>(null)

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        label: item.label || item.title || '',
        title: item.title || item.label || '',
      })),
    [items],
  )

  const activeItem = normalizedItems[activeIndex]

  if (!normalizedItems.length) {
    return null
  }

  return (
    <section className={styles.section} aria-label="Our values">
      <div className={styles.mediaPanel}>
        <Swiper
          className={styles.mediaSlider}
          slidesPerView={1}
          direction="vertical"
          allowTouchMove={false}
          speed={520}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
        >
          {normalizedItems.map((item, index) => (
            <SwiperSlide key={`${item.title || 'value'}-${index}`}>
              {item.media?.url ? (
                <Image
                  src={item.media.url}
                  alt={item.media.alt || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={styles.mediaImage}
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.contentPanel}>
        <div className={styles.contentTop}>
          <h2 className={`${styles.title} typo-h2`}>{activeItem?.title}</h2>
          {activeItem?.description && (
            <p className={`${styles.description} typo-body`}>{activeItem.description}</p>
          )}
        </div>

        <div className={styles.list}>
          {normalizedItems.map((item, index) => (
            <button
              key={`${item.label || item.title}-${index}`}
              className={`${styles.listItem} typo-body-lg ${index === activeIndex ? styles.listItemActive : ''}`}
              type="button"
              onMouseEnter={() => {
                setActiveIndex(index)
                if (swiperRef.current) {
                  swiperRef.current.slideTo(index)
                }
              }}
              onFocus={() => {
                setActiveIndex(index)
                if (swiperRef.current) {
                  swiperRef.current.slideTo(index)
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
