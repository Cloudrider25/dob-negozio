'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { CarouselItem } from '../shared/types'
import styles from './CarouselCard.module.css'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { Button } from '@/frontend/components/ui/primitives/button'
import { ButtonLink } from '@/frontend/components/ui/primitives/button-link'
import { resolveCarouselCtaLabel, type CarouselCtaLabel } from '../shared/contracts'

export const CarouselCard = ({
  item,
  cardClassName,
  mediaClassName,
  prioritizeImage = false,
  ctaLabel,
  onCtaClick,
}: {
  item: CarouselItem
  cardClassName?: string
  mediaClassName?: string
  prioritizeImage?: boolean
  ctaLabel?: CarouselCtaLabel
  onCtaClick?: (item: CarouselItem) => void
}) => {
  const router = useRouter()
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const sync = () => {
      setIsTouchDevice(mediaQuery.matches)
    }
    sync()
    mediaQuery.addEventListener('change', sync)
    return () => mediaQuery.removeEventListener('change', sync)
  }, [])

  const resolvedCtaLabel = resolveCarouselCtaLabel(item, ctaLabel)
  const ctaText = isTouchDevice && item.mobileCtaLabel ? item.mobileCtaLabel : resolvedCtaLabel

  const imageUrl = typeof item.image?.url === 'string' ? item.image.url.trim() : ''
  const hasImage = imageUrl.length > 0
  const singleBadge = item.badgeRight || item.tag || item.badgeLeft || null

  const handleNavigateToDetail = () => {
    if (!isTouchDevice || !item.href) return
    router.push(item.href)
  }

  return (
    <article
      className={`${styles.card} ${isTouchDevice && item.href ? styles.cardTouchLink : ''} typo-body ${cardClassName ?? ''}`}
      onClick={handleNavigateToDetail}
      onKeyDown={(event) => {
        if (!isTouchDevice || !item.href) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          router.push(item.href)
        }
      }}
      role={isTouchDevice && item.href ? 'link' : undefined}
      tabIndex={isTouchDevice && item.href ? 0 : undefined}
    >
      <div className={`${styles.media} ${mediaClassName ?? ''}`}>
        {singleBadge ? <span className={`${styles.badgeRight} typo-caption-upper`}>{singleBadge}</span> : null}
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={item.image.alt || item.title}
            fill
            sizes="(max-width: 699px) 86vw, (max-width: 1023px) 52vw, (max-width: 1279px) 34vw, 30vw"
            priority={prioritizeImage}
            loading={prioritizeImage ? 'eager' : 'lazy'}
            fetchPriority={prioritizeImage ? 'high' : 'auto'}
          />
        ) : (
          <span className={styles.mediaFallback} aria-hidden="true" />
        )}
      </div>
      <div className={styles.footerPanel}>
        <div className={styles.titleBlock}>
          <div className={styles.titleRow}>
            <div className={styles.titleText}>
              <SectionTitle as="h3" size="caption" uppercase className={styles.title}>
                {item.title}
              </SectionTitle>
              <SectionSubtitle size="small" className={`${styles.meta} ${styles.subtitle}`}>
                {item.subtitle || ''}
              </SectionSubtitle>
            </div>
            <div className={styles.priceBlock}>
              <span className={styles.price}>{item.price || ''}</span>
              <span className={`${styles.duration} typo-small`}>{item.duration || ''}</span>
            </div>
          </div>
        </div>
        <div className={styles.bottomBlock}>
          {onCtaClick ? (
            <Button
              className={styles.cta}
              type="button"
              kind="card"
              size="sm"
              interactive
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onCtaClick(item)
              }}
            >
              {ctaText}
            </Button>
          ) : item.href ? (
            <ButtonLink
              className={styles.cta}
              href={item.href}
              kind="card"
              size="sm"
              interactive
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              {ctaText}
            </ButtonLink>
          ) : (
            <Button className={styles.cta} type="button" kind="card" size="sm" interactive disabled>
              {ctaText}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
