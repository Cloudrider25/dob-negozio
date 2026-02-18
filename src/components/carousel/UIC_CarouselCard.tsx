'use client'

import Image from 'next/image'

import type { ServicesCarouselItem } from './types'
import styles from './UIC_CarouselCard.module.css'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'

export const UICCarouselCard = ({
  item,
  cardClassName,
  mediaClassName,
  prioritizeImage = false,
}: {
  item: ServicesCarouselItem
  cardClassName?: string
  mediaClassName?: string
  prioritizeImage?: boolean
}) => {
  return (
    <article className={`${styles.card} typo-body ${cardClassName ?? ''}`}>
      <div className={`${styles.media} ${mediaClassName ?? ''}`}>
        {item.badgeLeft && <span className={`${styles.badgeLeft} typo-caption-upper`}>{item.badgeLeft}</span>}
        {(item.badgeRight || item.tag) && (
          <span className={`${styles.badgeRight} typo-caption-upper`}>{item.badgeRight || item.tag}</span>
        )}
        <Image
          src={item.image.url}
          alt={item.image.alt || item.title}
          fill
          sizes="(max-width: 1024px) 70vw, 33vw"
          priority={prioritizeImage}
          loading={prioritizeImage ? 'eager' : 'lazy'}
          fetchPriority={prioritizeImage ? 'high' : 'auto'}
        />
      </div>
      <div className={styles.titleBlock}>
        <div className={styles.titleRow}>
          <SectionTitle as="h3" size="body" uppercase className={styles.title}>
            {item.title}
          </SectionTitle>
          <span className={styles.price}>{item.price || ''}</span>
        </div>
        <SectionSubtitle size="small" className={`${styles.meta} ${styles.subtitle}`}>
          {item.subtitle || ''}
        </SectionSubtitle>
      </div>
      <div className={styles.bottomBlock}>
        <div className={`${styles.meta} ${styles.metaRow} typo-small`}>
          <span>{item.duration || ''}</span>
        </div>
        {item.href ? (
          <ButtonLink className={styles.cta} href={item.href} kind="card" size="sm" interactive>
            Scopri {item.title}
          </ButtonLink>
        ) : (
          <Button className={styles.cta} type="button" kind="card" size="sm" interactive>
            Scopri {item.title}
          </Button>
        )}
      </div>
    </article>
  )
}
