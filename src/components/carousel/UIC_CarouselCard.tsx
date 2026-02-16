'use client'

import Image from 'next/image'

import type { ServicesCarouselItem } from './types'
import styles from './UIC_CarouselCard.module.css'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'

export const UICCarouselCard = ({
  item,
  cardClassName,
  mediaClassName,
}: {
  item: ServicesCarouselItem
  cardClassName?: string
  mediaClassName?: string
}) => {
  return (
    <article className={`${styles.card} ${cardClassName ?? ''}`}>
      <div className={`${styles.media} ${mediaClassName ?? ''}`}>
        {item.badgeLeft && <span className={styles.badgeLeft}>{item.badgeLeft}</span>}
        {(item.badgeRight || item.tag) && (
          <span className={styles.badgeRight}>{item.badgeRight || item.tag}</span>
        )}
        <Image src={item.image.url} alt={item.image.alt || item.title} fill sizes="(max-width: 1024px) 70vw, 33vw" />
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
