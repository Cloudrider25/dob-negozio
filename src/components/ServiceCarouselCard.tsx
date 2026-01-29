'use client'

import Image from 'next/image'
import Link from 'next/link'

import type { ServicesCarouselItem } from './service-carousel/types'
import styles from './ServiceCarouselCard.module.css'

export const ServiceCarouselCard = ({
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
        <Image src={item.image.url} alt={item.image.alt || item.title} fill sizes="(max-width: 900px) 70vw, 33vw" />
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
          <Link className={styles.cta} href={item.href}>
            Scopri {item.title}
          </Link>
        ) : (
          <button className={styles.cta} type="button">
            Scopri {item.title}
          </button>
        )}
      </div>
    </article>
  )
}
