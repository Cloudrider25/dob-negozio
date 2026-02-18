'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { SplitSection } from '@/components/ui/SplitSection'
import { Swiper, SwiperSlide, type UISwiperInstance } from '@/components/ui/swiper'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'

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
  const swiperRef = useRef<UISwiperInstance | null>(null)

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
    <SplitSection
      aria-label="Our values"
      className={styles.split}
      leftClassName={styles.mediaPanel}
      rightClassName={styles.contentPanel}
      left={
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
                  loading={index === activeIndex ? 'eager' : 'lazy'}
                  fetchPriority="auto"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      }
      right={
        <>
        <div className={styles.contentTop}>
          <SectionTitle as="h2" size="h2" className={styles.title}>
            {activeItem?.title}
          </SectionTitle>
          {activeItem?.description && (
            <SectionSubtitle className={styles.description}>{activeItem.description}</SectionSubtitle>
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
        </>
      }
    />
  )
}
