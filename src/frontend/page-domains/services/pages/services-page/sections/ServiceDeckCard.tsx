'use client'

import Image from 'next/image'
import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

import { CarouselCard } from '@/frontend/components/carousel/ui/CarouselCard'
import { getCarouselItemKey } from '@/frontend/components/carousel/shared/types'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import styles from './ServiceDeckCard.module.css'

type ServiceDeckCardProps = {
  title: string
  subtitle?: string | null
  price?: string | null
  count: number
  imageUrl: string
  imageAlt?: string | null
  childrenItems: CarouselItem[]
  onChildCtaClick?: (item: CarouselItem) => void
  coverClassName?: string
  childCardClassName?: string
}

export function ServiceDeckCard({
  title,
  subtitle,
  price,
  count,
  imageUrl,
  imageAlt,
  childrenItems,
  onChildCtaClick,
  coverClassName,
  childCardClassName,
}: ServiceDeckCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`${styles.root} ${expanded ? styles.rootExpanded : ''}`}>
      <button
        type="button"
        className={`${styles.cover} ${coverClassName ?? ''}`}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <div className={styles.coverInner}>
          <div className={styles.coverMedia}>
            {price ? <span className={`${styles.coverPriceBadge} typo-caption-upper`}>{price}</span> : null}
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              fill
              sizes="(max-width: 699px) 86vw, (max-width: 1023px) 52vw, (max-width: 1279px) 34vw, 30vw"
              className={styles.coverMediaImage}
            />
          </div>
          <div className={styles.coverMeta}>
            <div className={styles.coverTopRow}>
              <h3 className={`${styles.coverTitle} typo-caption-upper`}>{title}</h3>
            </div>
            {subtitle ? <p className={`${styles.coverSubtitle} typo-small`}>{subtitle}</p> : null}
            <div className={styles.coverFooter}>
              <span className={`${styles.coverCount} typo-small-upper`}>{count} servizi</span>
              <span className={styles.coverToggle} aria-hidden="true">
                <PlusIcon className={styles.coverToggleIcon} />
              </span>
            </div>
          </div>
        </div>
      </button>

      {expanded ? (
        <div className={styles.childrenGrid}>
          {childrenItems.map((item, index) => (
            <CarouselCard
              key={getCarouselItemKey(item, index)}
              item={item}
              cardClassName={childCardClassName ?? styles.childCompactMobile}
              onCtaClick={item.ctaAction ? onChildCtaClick : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
