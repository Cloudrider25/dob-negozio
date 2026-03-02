'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { SplitSection } from '@/components/ui/SplitSection'
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
        <div className={styles.mediaSlider}>
          {normalizedItems.map((item, index) => (
            <div
              key={`${item.title || 'value'}-${index}`}
              className={`${styles.mediaSlide} ${index === activeIndex ? styles.mediaSlideActive : styles.mediaSlideInactive}`}
            >
              {item.media?.url ? (
                <Image
                  src={item.media.url}
                  alt={item.media.alt || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  loading={index === activeIndex ? 'eager' : 'lazy'}
                  fetchPriority="auto"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </div>
          ))}
        </div>
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
              }}
              onFocus={() => {
                setActiveIndex(index)
              }}
              onClick={() => {
                setActiveIndex(index)
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
